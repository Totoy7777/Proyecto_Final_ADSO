package com.proyecto_final.tienda_adso.service.payment;

import com.proyecto_final.tienda_adso.model.Payment;

import java.time.LocalDateTime;

public class PaymentResult {

    private final boolean approved;
    private final Payment.EstadoPago status;
    private final String method;
    private final String reference;
    private final String details;
    private final LocalDateTime processedAt;

    public PaymentResult(boolean approved,
                         Payment.EstadoPago status,
                         String method,
                         String reference,
                         String details,
                         LocalDateTime processedAt) {
        this.approved = approved;
        this.status = status;
        this.method = method;
        this.reference = reference;
        this.details = details;
        this.processedAt = processedAt;
    }

    public boolean isApproved() {
        return approved;
    }

    public Payment.EstadoPago getStatus() {
        return status;
    }

    public String getMethod() {
        return method;
    }

    public String getReference() {
        return reference;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
}
