package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.dto.CheckoutRequest;
import com.proyecto_final.tienda_adso.dto.CheckoutResponse;
import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.repository.*;
import com.proyecto_final.tienda_adso.service.payment.PaymentProcessor;
import com.proyecto_final.tienda_adso.service.payment.PaymentResult;
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
    @Autowired private PaymentProcessor paymentProcessor;
    @Autowired private ShipmentEventRepository shipmentEventRepository;

    @Transactional
    public CheckoutResponse checkoutFromCart(Cart cart, CheckoutRequest request) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }
        if (request == null) {
            throw new IllegalArgumentException("Los datos de checkout son obligatorios");
        }
        if (request.getPayment() == null) {
            throw new IllegalArgumentException("La información del método de pago es obligatoria");
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

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setCantidad(ci.getCantidad());
            oi.setPrecioUnitario(ci.getPrecioUnitario());
            oi.setId(new OrderItemId(order.getOrderId(), product.getProductId()));
            orderItems.add(oi);

            total = total.add(ci.getPrecioUnitario().multiply(BigDecimal.valueOf(ci.getCantidad())));
        }

        order.setTotal(total);
        order.setItems(orderItems);

        PaymentResult paymentResult = paymentProcessor.process(order.getUser(), total, request.getPayment());
        if (!paymentResult.isApproved()) {
            throw new IllegalStateException("El pago fue rechazado por la pasarela simulada");
        }

        Payment payment = buildPayment(order, total, request.getPayment(), paymentResult);
        payment = paymentRepository.save(payment);
        order.setPayment(payment);
        order.setEstado(Order.OrderEstado.PAGADO);

        Shipment shipment = buildShipment(order, request);
        shipment = shipmentRepository.save(shipment);
        refreshShipmentEvents(shipment);
        order.setShipment(shipment);

        Invoice invoice = buildInvoice(order, total);
        invoice = invoiceRepository.save(invoice);
        order.setInvoice(invoice);

        order = orderRepository.save(order);

        cartItemRepository.deleteAll(snapshot);
        // Limpia la relación en memoria para evitar que Hibernate intente re-mergear
        // entidades CartItem ya eliminadas durante el save del carrito.
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        cart.setEstado(Cart.CartEstado.CERRADO);
        cartRepository.save(cart);

        refreshShipmentEvents(order.getShipment());
        invoiceEmailService.sendInvoice(order.getUser(), order, payment, shipment, orderItems);

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

    private Payment buildPayment(Order order,
                                 BigDecimal total,
                                 CheckoutRequest.PaymentRequest paymentRequest,
                                 PaymentResult paymentResult) {
        Payment payment = new Payment();
        payment.setOrder(order);

        String resolvedMethod = paymentResult.getMethod();
        if (!StringUtils.hasText(resolvedMethod) && paymentRequest != null) {
            resolvedMethod = normalizePaymentMethod(paymentRequest.getMethod());
        }
        payment.setMetodoPago(StringUtils.hasText(resolvedMethod) ? resolvedMethod : "DESCONOCIDO");

        payment.setMonto(total);
        payment.setEstadoPago(paymentResult.getStatus() != null
                ? paymentResult.getStatus()
                : Payment.EstadoPago.APROBADO);
        payment.setFechaPago(paymentResult.getProcessedAt() != null
                ? paymentResult.getProcessedAt()
                : LocalDateTime.now());

        String reference = paymentResult.getReference();
        if (!StringUtils.hasText(reference)) {
            reference = "PAY-" + UUID.randomUUID();
        }
        payment.setReferenciaTx(reference);

        String details = paymentResult.getDetails();
        if (!StringUtils.hasText(details)) {
            details = extractPaymentDetails(paymentRequest);
        }
        payment.setDetallesPago(details);
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
        registerShipmentEvent(shipment, Shipment.EstadoEnvio.LISTO, buildInitialShipmentMessage(request));
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

    private String buildInitialShipmentMessage(CheckoutRequest request) {
        StringBuilder builder = new StringBuilder("Pedido confirmado y listo para despacho");
        if (request != null && StringUtils.hasText(request.getShippingCity())) {
            builder.append(" hacia ")
                    .append(request.getShippingCity().trim());
        }
        builder.append('.');
        return builder.toString();
    }

    private void registerShipmentEvent(Shipment shipment,
                                       Shipment.EstadoEnvio estado,
                                       String mensaje) {
        if (shipment == null || estado == null) {
            return;
        }
        ShipmentEvent event = new ShipmentEvent();
        event.setEstado(estado);
        if (StringUtils.hasText(mensaje)) {
            event.setMensaje(mensaje.trim());
        }
        event.setRegistradoEn(LocalDateTime.now());
        shipment.addEvento(event);
        // Persistir el evento explícitamente para evitar problemas con el cascade
        shipmentEventRepository.save(event);
    }

    private void refreshShipmentEvents(Shipment shipment) {
        if (shipment == null) {
            return;
        }
        // No reemplazar la colección con orphanRemoval; solo asegurar carga perezosa
        List<ShipmentEvent> existing = shipment.getEventos();
        if (existing != null) {
            existing.size();
        }
    }

    private String buildShipmentEventMessage(Shipment.EstadoEnvio estado, String notas) {
        if (StringUtils.hasText(notas)) {
            return notas.trim();
        }
        if (estado == null) {
            return "Estado de envío actualizado.";
        }
        return switch (estado) {
            case LISTO -> "Pedido listo para salir del local.";
            case ENVIADO -> "El pedido está en ruta hacia tu dirección.";
            case ENTREGADO -> "El pedido fue entregado exitosamente.";
            case DEVUELTO -> "El pedido fue devuelto al remitente.";
        };
    }

    private void hydrateOrder(Order order) {
        if (order == null) {
            return;
        }
        // Solo inicializar sin reemplazar la colección para evitar orphanRemoval accidental
        if (order.getItems() != null) {
            order.getItems().size();
        }
        if (order.getShipment() != null) {
            refreshShipmentEvents(order.getShipment());
        }
    }

    public List<Order> findByUser(User user) {
        List<Order> orders = orderRepository.findByUser(user);
        for (Order order : orders) {
            hydrateOrder(order);
        }
        return orders;
    }

    public Order findById(int id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no existe"));
        hydrateOrder(order);
        return order;
    }

    public List<Order> findAllWithDetails() {
        List<Order> orders = orderRepository.findAll();
        for (Order order : orders) {
            hydrateOrder(order);
        }
        return orders;
    }

    @Transactional
    public void deleteOrder(Order order) {
        if (order == null) {
            return;
        }
        order.setHiddenForUser(true);
        orderRepository.save(order);
    }

    @Transactional
    public int deleteOrdersByUser(User user) {
        if (user == null) return 0;
        List<Order> orders = orderRepository.findByUser(user);
        if (orders == null || orders.isEmpty()) return 0;
        int count = 0;
        for (Order order : orders) {
            if (order.getHiddenForUser() == null || !order.getHiddenForUser()) {
                order.setHiddenForUser(true);
                count++;
            }
        }
        if (count > 0) {
            orderRepository.saveAll(orders);
        }
        return count;
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
        hydrateOrder(order);
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

        if (order.getEstado() == Order.OrderEstado.CANCELADO && estado == Shipment.EstadoEnvio.ENTREGADO) {
            throw new IllegalStateException("No puedes marcar como ENTREGADO una orden cancelada");
        }

        Shipment.EstadoEnvio previousEstado = shipment.getEstadoEnvio();
        Shipment.EstadoEnvio nextEstado = estado != null ? estado : previousEstado;

        if (estado != null) {
            shipment.setEstadoEnvio(estado);
            if (estado == Shipment.EstadoEnvio.ENVIADO && shipment.getFechaEnvio() == null && fechaEnvio == null) {
                shipment.setFechaEnvio(LocalDateTime.now());
            }
            if (estado == Shipment.EstadoEnvio.ENVIADO || estado == Shipment.EstadoEnvio.ENTREGADO) {
                order.setEstado(Order.OrderEstado.ENVIADO);
            }
            if (estado == Shipment.EstadoEnvio.DEVUELTO) {
                order.setEstado(Order.OrderEstado.CANCELADO);
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

        // Ajuste de stock al cambiar el estado de envío
        boolean wasDelivered = previousEstado == Shipment.EstadoEnvio.ENTREGADO;
        // Si pasamos a ENTREGADO y antes no lo estaba, descontar stock de los productos
        if (!wasDelivered && nextEstado == Shipment.EstadoEnvio.ENTREGADO) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                Product product = productRepository.findById(item.getProduct().getProductId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                int current = product.getStock() == null ? 0 : product.getStock();
                int qty = item.getCantidad() == null ? 0 : item.getCantidad();
                if (current < qty) {
                    throw new IllegalStateException("Stock insuficiente para finalizar entrega de " + (product.getName() != null ? product.getName() : ("ID " + product.getProductId())));
                }
                product.setStock(current - qty);
                productRepository.save(product);
            }
        }
        // Si estaba ENTREGADO y cambiamos a otro estado (ej. DEVUELTO), reponer stock
        else if (wasDelivered && nextEstado != Shipment.EstadoEnvio.ENTREGADO) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                Product product = productRepository.findById(item.getProduct().getProductId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                int current = product.getStock() == null ? 0 : product.getStock();
                int qty = item.getCantidad() == null ? 0 : item.getCantidad();
                product.setStock(current + qty);
                productRepository.save(product);
            }
        }

        registerShipmentEvent(shipment, nextEstado, buildShipmentEventMessage(nextEstado, notas));

        shipmentRepository.save(shipment);
        orderRepository.save(order);
        refreshShipmentEvents(shipment);
        return order;
    }

    @Transactional
    public Order updateOrderStatus(int orderId, Order.OrderEstado estado) {
        Order order = findById(orderId);
        Order.OrderEstado previous = order.getEstado();
        order.setEstado(estado);

        // Si cancelamos la orden y previamente el envío estaba ENTREGADO, devolver stock
        if (estado == Order.OrderEstado.CANCELADO && order.getShipment() != null) {
            Shipment shipment = order.getShipment();
            if (shipment.getEstadoEnvio() == Shipment.EstadoEnvio.ENTREGADO) {
                List<OrderItem> items = orderItemRepository.findByOrder(order);
                for (OrderItem item : items) {
                    Product product = productRepository.findById(item.getProduct().getProductId())
                            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                    int current = product.getStock() == null ? 0 : product.getStock();
                    int qty = item.getCantidad() == null ? 0 : item.getCantidad();
                    product.setStock(current + qty);
                    productRepository.save(product);
                }
            }
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order addShipmentEvent(int orderId,
                                  Shipment.EstadoEnvio estado,
                                  String mensaje,
                                  LocalDateTime fecha) {
        Order order = findById(orderId);
        Shipment shipment = order.getShipment();
        if (shipment == null) {
            throw new IllegalStateException("La orden no tiene envío asociado");
        }

        if (order.getEstado() == Order.OrderEstado.CANCELADO && estado == Shipment.EstadoEnvio.ENTREGADO) {
            throw new IllegalStateException("No puedes registrar ENTREGADO en una orden cancelada");
        }

        if (estado != null) {
            shipment.setEstadoEnvio(estado);
            if (estado == Shipment.EstadoEnvio.ENVIADO && shipment.getFechaEnvio() == null && fecha == null) {
                shipment.setFechaEnvio(LocalDateTime.now());
            }
        }
        if (fecha != null) {
            shipment.setFechaEnvio(fecha);
        }

        String mensajeFinal = buildShipmentEventMessage(estado, mensaje);
        registerShipmentEvent(shipment, estado != null ? estado : shipment.getEstadoEnvio(), mensajeFinal);

        shipmentRepository.save(shipment);
        orderRepository.save(order);
        hydrateOrder(order);
        return order;
    }
}
