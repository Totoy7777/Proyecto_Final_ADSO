package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.OrderItem;
import com.proyecto_final.tienda_adso.model.Payment;
import com.proyecto_final.tienda_adso.model.Shipment;
import com.proyecto_final.tienda_adso.model.ShipmentEvent;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderSummaryDTO toSummary(Order order) {
        if (order == null) {
            return null;
        }
        OrderSummaryDTO dto = new OrderSummaryDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderedAt(order.getFechaPedido());
        dto.setStatus(order.getEstado() != null ? order.getEstado().name() : null);
        dto.setTotal(order.getTotal());
        dto.setInvoiceNumber(order.getInvoice() != null ? order.getInvoice().getNumero() : null);
        dto.setItems(mapItems(order.getItems()));
        dto.setPayment(mapPayment(order.getPayment()));
        dto.setShipment(mapShipment(order.getShipment()));
        return dto;
    }

    private static List<OrderItemDTO> mapItems(List<OrderItem> items) {
        if (items == null) {
            return Collections.emptyList();
        }
        return items.stream().map(item -> {
            OrderItemDTO dto = new OrderItemDTO();
            dto.setProductId(item.getProduct() != null ? item.getProduct().getProductId() : item.getId().getProductId());
            dto.setName(item.getProduct() != null ? item.getProduct().getName() : "Producto");
            dto.setImageUrl(item.getProduct() != null ? item.getProduct().getImageUrl() : null);
            dto.setQuantity(item.getCantidad());
            dto.setUnitPrice(item.getPrecioUnitario());
            BigDecimal lineTotal = item.getPrecioUnitario() != null
                    ? item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()))
                    : BigDecimal.ZERO;
            dto.setLineTotal(lineTotal);
            return dto;
        }).collect(Collectors.toList());
    }

    private static PaymentSummaryDTO mapPayment(Payment payment) {
        if (payment == null) {
            return null;
        }
        PaymentSummaryDTO dto = new PaymentSummaryDTO();
        dto.setStatus(payment.getEstadoPago() != null ? payment.getEstadoPago().name() : null);
        dto.setMethod(payment.getMetodoPago());
        dto.setReference(payment.getReferenciaTx());
        dto.setDetails(payment.getDetallesPago());
        dto.setPaidAt(payment.getFechaPago());
        return dto;
    }

    private static ShipmentSummaryDTO mapShipment(Shipment shipment) {
        if (shipment == null) {
            return null;
        }
        ShipmentSummaryDTO dto = new ShipmentSummaryDTO();
        dto.setShipmentId(shipment.getShippingId());
        dto.setStatus(shipment.getEstadoEnvio() != null ? shipment.getEstadoEnvio().name() : null);
        dto.setTracking(shipment.getTracking());
        dto.setNotes(shipment.getNotasEnvio());
        dto.setShippedAt(shipment.getFechaEnvio());
        dto.setEvents(mapEvents(shipment.getEventos()));
        return dto;
    }

    private static List<ShipmentEventDTO> mapEvents(List<ShipmentEvent> events) {
        if (events == null) {
            return Collections.emptyList();
        }
        return events.stream()
                .filter(Objects::nonNull)
                .map(event -> {
                    ShipmentEventDTO dto = new ShipmentEventDTO();
                    dto.setEventId(event.getEventId());
                    dto.setStatus(event.getEstado() != null ? event.getEstado().name() : null);
                    dto.setMessage(event.getMensaje());
                    dto.setRegisteredAt(event.getRegistradoEn());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
