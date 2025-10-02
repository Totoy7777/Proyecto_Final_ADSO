package com.proyecto_final.tienda_adso.dto.admin;

import com.proyecto_final.tienda_adso.model.*;

import java.util.ArrayList;
import java.util.List;

public final class AdminOrderMapper {

    private AdminOrderMapper() {}

    public static AdminOrderDTO toDTO(Order order) {
        if (order == null) return null;

        AdminOrderDTO dto = new AdminOrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setEstado(order.getEstado() != null ? order.getEstado().name() : null);
        dto.setTotal(order.getTotal());

        dto.setUser(mapUser(order.getUser()));
        dto.setPayment(mapPayment(order.getPayment()));
        dto.setShipment(mapShipment(order.getShipment()));
        dto.setItems(mapItems(order.getItems()));

        return dto;
    }

    private static AdminOrderDTO.AdminUserDTO mapUser(User user) {
        if (user == null) return null;
        AdminOrderDTO.AdminUserDTO dto = new AdminOrderDTO.AdminUserDTO();
        dto.setUserId(user.getUserId());
        dto.setNombre(user.getNombre());
        dto.setEmail(user.getEmail());
        return dto;
    }

    private static AdminOrderDTO.AdminPaymentDTO mapPayment(Payment payment) {
        if (payment == null) return null;
        AdminOrderDTO.AdminPaymentDTO dto = new AdminOrderDTO.AdminPaymentDTO();
        dto.setEstadoPago(payment.getEstadoPago() != null ? payment.getEstadoPago().name() : null);
        dto.setFechaPago(payment.getFechaPago());
        dto.setReferenciaTx(payment.getReferenciaTx());
        dto.setMetodoPago(payment.getMetodoPago());
        return dto;
    }

    private static AdminOrderDTO.AdminShipmentDTO mapShipment(Shipment shipment) {
        if (shipment == null) return null;
        AdminOrderDTO.AdminShipmentDTO dto = new AdminOrderDTO.AdminShipmentDTO();
        dto.setShippingId(shipment.getShippingId());
        dto.setEstadoEnvio(shipment.getEstadoEnvio() != null ? shipment.getEstadoEnvio().name() : null);
        dto.setTracking(shipment.getTracking());
        dto.setNotasEnvio(shipment.getNotasEnvio());
        dto.setFechaEnvio(shipment.getFechaEnvio());
        dto.setEventos(mapEvents(shipment.getEventos()));
        return dto;
    }

    private static List<AdminOrderDTO.AdminShipmentEventDTO> mapEvents(List<ShipmentEvent> events) {
        List<AdminOrderDTO.AdminShipmentEventDTO> list = new ArrayList<>();
        if (events == null) return list;
        for (ShipmentEvent e : events) {
            if (e == null) continue;
            AdminOrderDTO.AdminShipmentEventDTO dto = new AdminOrderDTO.AdminShipmentEventDTO();
            dto.setEventId(e.getEventId());
            dto.setEstado(e.getEstado() != null ? e.getEstado().name() : null);
            dto.setMensaje(e.getMensaje());
            dto.setRegistradoEn(e.getRegistradoEn());
            list.add(dto);
        }
        return list;
    }

    private static List<AdminOrderDTO.AdminOrderItemDTO> mapItems(List<OrderItem> items) {
        List<AdminOrderDTO.AdminOrderItemDTO> list = new ArrayList<>();
        if (items == null) return list;
        for (OrderItem item : items) {
            if (item == null) continue;
            AdminOrderDTO.AdminOrderItemDTO dto = new AdminOrderDTO.AdminOrderItemDTO();

            AdminOrderDTO.AdminOrderItemIdDTO id = new AdminOrderDTO.AdminOrderItemIdDTO();
            if (item.getId() != null) {
                id.setOrderId(item.getId().getOrderId());
                id.setProductId(item.getId().getProductId());
            }
            dto.setId(id);

            Product p = item.getProduct();
            AdminOrderDTO.AdminProductDTO prod = new AdminOrderDTO.AdminProductDTO();
            if (p != null) {
                prod.setProductId(p.getProductId());
                prod.setName(p.getName());
                prod.setImageUrl(p.getImageUrl());
            }
            dto.setProduct(prod);

            dto.setCantidad(item.getCantidad());
            dto.setPrecioUnitario(item.getPrecioUnitario());

            list.add(dto);
        }
        return list;
    }
}

