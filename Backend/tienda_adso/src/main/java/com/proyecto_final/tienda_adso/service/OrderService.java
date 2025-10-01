package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.dto.CheckoutRequest;
import com.proyecto_final.tienda_adso.dto.CheckoutResponse;
import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InvoiceEmailService invoiceEmailService;

    @Transactional
    public CheckoutResponse checkoutFromCart(Cart cart, CheckoutRequest request) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }
        if (request == null) {
            throw new IllegalArgumentException("Los datos de checkout son obligatorios");
        }

        if (cart.getUser() == null || request.getUserId() == null ||
                cart.getUser().getUserId() != request.getUserId()) {
            throw new IllegalArgumentException("El carrito no pertenece al usuario indicado");
        }

        List<CartItem> snapshot = new ArrayList<>(cart.getItems());
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setEstado(Order.OrderEstado.NUEVO);
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : snapshot) {
            Product product = productRepository.findById(ci.getProduct().getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (product.getStock() == null || ci.getCantidad() > product.getStock()) {
                throw new IllegalArgumentException("No hay stock suficiente para " + product.getName());
            }

            product.setStock(product.getStock() - ci.getCantidad());
            productRepository.save(product);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setCantidad(ci.getCantidad());
            oi.setPrecioUnitario(ci.getPrecioUnitario());
            oi.setId(new OrderItemId(order.getOrderId(), product.getProductId()));
            orderItemRepository.save(oi);
            orderItems.add(oi);

            total = total.add(ci.getPrecioUnitario().multiply(BigDecimal.valueOf(ci.getCantidad())));
        }

        order.setTotal(total);
        order.setItems(orderItems);

        Payment payment = buildPayment(order, total, request.getPayment());
        payment = paymentRepository.save(payment);
        order.setPayment(payment);
        order.setEstado(Order.OrderEstado.PAGADO);

        Shipment shipment = buildShipment(order, request);
        shipment = shipmentRepository.save(shipment);
        order.setShipment(shipment);

        Invoice invoice = buildInvoice(order, total);
        invoice = invoiceRepository.save(invoice);
        order.setInvoice(invoice);

        order = orderRepository.save(order);

        cartItemRepository.deleteAll(snapshot);
        cart.setEstado(Cart.CartEstado.CERRADO);
        cartRepository.save(cart);

        List<OrderItem> persistedItems = orderItemRepository.findByOrder(order);
        invoiceEmailService.sendInvoice(order.getUser(), order, payment, shipment, persistedItems);

        CheckoutResponse response = new CheckoutResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderStatus(order.getEstado().name());
        response.setTotal(total);
        response.setPaymentId(payment.getPaymentId());
        response.setPaymentStatus(payment.getEstadoPago().name());
        response.setPaymentMethod(payment.getMetodoPago());
        response.setPaymentReference(payment.getReferenciaTx());
        response.setPaymentDate(payment.getFechaPago());
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceNumber(invoice.getNumero());
        response.setShipmentId(shipment.getShippingId());
        response.setShipmentStatus(shipment.getEstadoEnvio().name());
        return response;
    }

    private Payment buildPayment(Order order, BigDecimal total, CheckoutRequest.PaymentRequest paymentRequest) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMetodoPago(normalizePaymentMethod(paymentRequest.getMethod()));
        payment.setMonto(total);
        payment.setEstadoPago(Payment.EstadoPago.APROBADO);
        payment.setFechaPago(LocalDateTime.now());
        payment.setReferenciaTx("PAY-" + UUID.randomUUID());
        payment.setDetallesPago(extractPaymentDetails(paymentRequest));
        return payment;
    }

    private Shipment buildShipment(Order order, CheckoutRequest request) {
        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setDireccionEnvio(formatAddress(request));
        shipment.setNombreDestinatario(request.getShippingName());
        shipment.setTelefonoContacto(request.getShippingPhone());
        shipment.setNotasEnvio(request.getNotes());
        shipment.setEstadoEnvio(Shipment.EstadoEnvio.LISTO);
        return shipment;
    }

    private Invoice buildInvoice(Order order, BigDecimal total) {
        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setNumero(generateInvoiceNumber(order.getOrderId()));
        invoice.setTotal(total);
        return invoice;
    }

    private String normalizePaymentMethod(String method) {
        if (!StringUtils.hasText(method)) {
            return "DESCONOCIDO";
        }
        return method.trim().toUpperCase(Locale.ROOT);
    }

    private String extractPaymentDetails(CheckoutRequest.PaymentRequest payment) {
        if (payment == null) {
            return null;
        }
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(payment.getWalletPhone())) {
            builder.append("wallet=").append(payment.getWalletPhone()).append(';');
        }
        if (StringUtils.hasText(payment.getPseEntity())) {
            builder.append("pse=").append(payment.getPseEntity()).append(';');
        }
        if (StringUtils.hasText(payment.getCardHolder())) {
            builder.append("holder=").append(payment.getCardHolder()).append(';');
        }
        if (StringUtils.hasText(payment.getCardNumber())) {
            String number = payment.getCardNumber().trim();
            String last4 = number.length() > 4 ? number.substring(number.length() - 4) : number;
            builder.append("card=****").append(last4).append(';');
        }
        if (StringUtils.hasText(payment.getCardExpiration())) {
            builder.append("exp=").append(payment.getCardExpiration()).append(';');
        }
        return builder.length() == 0 ? null : builder.toString();
    }

    private String formatAddress(CheckoutRequest request) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(request.getShippingAddress())) {
            builder.append(request.getShippingAddress().trim());
        }
        if (StringUtils.hasText(request.getShippingCity())) {
            if (builder.length() > 0) {
                builder.append(", ");
            }
            builder.append(request.getShippingCity().trim());
        }
        return builder.toString();
    }

    private String generateInvoiceNumber(int orderId) {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"));
        return "INV-" + datePart + "-" + orderId;
    }

    public List<Order> findByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public Order findById(int id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no existe"));
    }

    public List<Order> findAllWithDetails() {
        List<Order> orders = orderRepository.findAll();
        for (Order order : orders) {
            order.setItems(orderItemRepository.findByOrder(order));
        }
        return orders;
    }

    @Transactional
    public Order updatePaymentStatus(int orderId, Payment.EstadoPago estado, String referencia, String detalles) {
        Order order = findById(orderId);
        Payment payment = order.getPayment();
        if (payment == null) {
            throw new IllegalStateException("La orden no tiene pago asociado");
        }

        if (estado != null) {
            payment.setEstadoPago(estado);
            if (estado == Payment.EstadoPago.APROBADO && payment.getFechaPago() == null) {
                payment.setFechaPago(LocalDateTime.now());
                order.setEstado(Order.OrderEstado.PAGADO);
            }
            if (estado == Payment.EstadoPago.FALLIDO) {
                order.setEstado(Order.OrderEstado.CANCELADO);
            }
        }
        if (referencia != null) {
            payment.setReferenciaTx(referencia.isBlank() ? null : referencia.trim());
        }
        if (detalles != null) {
            payment.setDetallesPago(detalles.isBlank() ? null : detalles.trim());
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
        return order;
    }

    @Transactional
    public Order updateShipmentStatus(int orderId,
                                      Shipment.EstadoEnvio estado,
                                      String tracking,
                                      String notas,
                                      LocalDateTime fechaEnvio) {
        Order order = findById(orderId);
        Shipment shipment = order.getShipment();
        if (shipment == null) {
            throw new IllegalStateException("La orden no tiene envío asociado");
        }

        if (estado != null) {
            shipment.setEstadoEnvio(estado);
            if (estado == Shipment.EstadoEnvio.ENVIADO && shipment.getFechaEnvio() == null && fechaEnvio == null) {
                shipment.setFechaEnvio(LocalDateTime.now());
            }
            if (estado == Shipment.EstadoEnvio.ENVIADO || estado == Shipment.EstadoEnvio.ENTREGADO) {
                order.setEstado(Order.OrderEstado.ENVIADO);
            }
        }

        if (fechaEnvio != null) {
            shipment.setFechaEnvio(fechaEnvio);
        }
        if (tracking != null) {
            shipment.setTracking(tracking.isBlank() ? null : tracking.trim());
        }
        if (notas != null) {
            shipment.setNotasEnvio(notas.isBlank() ? null : notas.trim());
        }

        shipmentRepository.save(shipment);
        orderRepository.save(order);
        return order;
    }

    @Transactional
    public Order updateOrderStatus(int orderId, Order.OrderEstado estado) {
        Order order = findById(orderId);
        order.setEstado(estado);
        return orderRepository.save(order);
    }
}
