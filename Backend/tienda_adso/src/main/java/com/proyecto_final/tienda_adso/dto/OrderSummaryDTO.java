package com.proyecto_final.tienda_adso.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderSummaryDTO {

    private int orderId;
    private LocalDateTime orderedAt;
    private String status;
    private BigDecimal total;
    private String invoiceNumber;
    private PaymentSummaryDTO payment;
    private ShipmentSummaryDTO shipment;
    private List<OrderItemDTO> items;

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public PaymentSummaryDTO getPayment() {
        return payment;
    }

    public void setPayment(PaymentSummaryDTO payment) {
        this.payment = payment;
    }

    public ShipmentSummaryDTO getShipment() {
        return shipment;
    }

    public void setShipment(ShipmentSummaryDTO shipment) {
        this.shipment = shipment;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}
