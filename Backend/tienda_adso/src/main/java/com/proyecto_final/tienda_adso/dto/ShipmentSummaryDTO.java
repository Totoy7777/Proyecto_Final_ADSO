package com.proyecto_final.tienda_adso.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ShipmentSummaryDTO {

    private int shipmentId;
    private String status;
    private String tracking;
    private String notes;
    private LocalDateTime shippedAt;
    private List<ShipmentEventDTO> events;

    public int getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(int shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTracking() {
        return tracking;
    }

    public void setTracking(String tracking) {
        this.tracking = tracking;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getShippedAt() {
        return shippedAt;
    }

    public void setShippedAt(LocalDateTime shippedAt) {
        this.shippedAt = shippedAt;
    }

    public List<ShipmentEventDTO> getEvents() {
        return events;
    }

    public void setEvents(List<ShipmentEventDTO> events) {
        this.events = events;
    }
}
