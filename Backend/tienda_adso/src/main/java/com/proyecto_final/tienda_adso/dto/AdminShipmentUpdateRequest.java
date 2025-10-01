package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Shipment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AdminShipmentUpdateRequest {

    @NotNull
    private Shipment.EstadoEnvio estado;

    @Size(max = 100)
    private String tracking;

    @Size(max = 255)
    private String notas;

    private LocalDateTime fechaEnvio;

    public Shipment.EstadoEnvio getEstado() {
        return estado;
    }

    public void setEstado(Shipment.EstadoEnvio estado) {
        this.estado = estado;
    }

    public String getTracking() {
        return tracking;
    }

    public void setTracking(String tracking) {
        this.tracking = tracking;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(LocalDateTime fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }
}
