package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Payment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminPaymentUpdateRequest {

    @NotNull
    private Payment.EstadoPago estado;

    @Size(max = 120)
    private String referencia;

    @Size(max = 255)
    private String detalles;

    public Payment.EstadoPago getEstado() {
        return estado;
    }

    public void setEstado(Payment.EstadoPago estado) {
        this.estado = estado;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getDetalles() {
        return detalles;
    }

    public void setDetalles(String detalles) {
        this.detalles = detalles;
    }
}
