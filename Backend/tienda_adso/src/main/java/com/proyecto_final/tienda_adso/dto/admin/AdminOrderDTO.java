package com.proyecto_final.tienda_adso.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderDTO {
    private int orderId;
    private String estado;
    private BigDecimal total;
    private AdminUserDTO user;
    private AdminPaymentDTO payment;
    private AdminShipmentDTO shipment;
    private List<AdminOrderItemDTO> items;

    public int getOrderId() { return orderId; }
    public void setOrderId(int orderId) { this.orderId = orderId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public AdminUserDTO getUser() { return user; }
    public void setUser(AdminUserDTO user) { this.user = user; }

    public AdminPaymentDTO getPayment() { return payment; }
    public void setPayment(AdminPaymentDTO payment) { this.payment = payment; }

    public AdminShipmentDTO getShipment() { return shipment; }
    public void setShipment(AdminShipmentDTO shipment) { this.shipment = shipment; }

    public List<AdminOrderItemDTO> getItems() { return items; }
    public void setItems(List<AdminOrderItemDTO> items) { this.items = items; }

    // Nested DTOs
    public static class AdminUserDTO {
        private Integer userId;
        private String nombre;
        private String email;

        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class AdminPaymentDTO {
        private String estadoPago;
        private LocalDateTime fechaPago;
        private String referenciaTx;
        private String metodoPago;

        public String getEstadoPago() { return estadoPago; }
        public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

        public LocalDateTime getFechaPago() { return fechaPago; }
        public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

        public String getReferenciaTx() { return referenciaTx; }
        public void setReferenciaTx(String referenciaTx) { this.referenciaTx = referenciaTx; }

        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    }

    public static class AdminShipmentDTO {
        private Integer shippingId;
        private String estadoEnvio;
        private String tracking;
        private String notasEnvio;
        private LocalDateTime fechaEnvio;
        private List<AdminShipmentEventDTO> eventos;

        public Integer getShippingId() { return shippingId; }
        public void setShippingId(Integer shippingId) { this.shippingId = shippingId; }

        public String getEstadoEnvio() { return estadoEnvio; }
        public void setEstadoEnvio(String estadoEnvio) { this.estadoEnvio = estadoEnvio; }

        public String getTracking() { return tracking; }
        public void setTracking(String tracking) { this.tracking = tracking; }

        public String getNotasEnvio() { return notasEnvio; }
        public void setNotasEnvio(String notasEnvio) { this.notasEnvio = notasEnvio; }

        public LocalDateTime getFechaEnvio() { return fechaEnvio; }
        public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

        public List<AdminShipmentEventDTO> getEventos() { return eventos; }
        public void setEventos(List<AdminShipmentEventDTO> eventos) { this.eventos = eventos; }
    }

    public static class AdminShipmentEventDTO {
        private Long eventId;
        private String estado;
        private String mensaje;
        private LocalDateTime registradoEn;

        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }

        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }

        public LocalDateTime getRegistradoEn() { return registradoEn; }
        public void setRegistradoEn(LocalDateTime registradoEn) { this.registradoEn = registradoEn; }
    }

    public static class AdminOrderItemDTO {
        private AdminOrderItemIdDTO id;
        private AdminProductDTO product;
        private Integer cantidad;
        private BigDecimal precioUnitario;

        public AdminOrderItemIdDTO getId() { return id; }
        public void setId(AdminOrderItemIdDTO id) { this.id = id; }

        public AdminProductDTO getProduct() { return product; }
        public void setProduct(AdminProductDTO product) { this.product = product; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    }

    public static class AdminOrderItemIdDTO {
        private Integer orderId;
        private Integer productId;

        public Integer getOrderId() { return orderId; }
        public void setOrderId(Integer orderId) { this.orderId = orderId; }

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
    }

    public static class AdminProductDTO {
        private Integer productId;
        private String name;
        private String imageUrl;

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}

