package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Shipment;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AdminShipmentEventRequest {

    private Shipment.EstadoEnvio estado;

    @Size(max = 255)
    private String mensaje;

    private LocalDateTime fecha;

    public Shipment.EstadoEnvio getEstado() {
        return estado;
    }

    public void setEstado(Shipment.EstadoEnvio estado) {
        this.estado = estado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}

