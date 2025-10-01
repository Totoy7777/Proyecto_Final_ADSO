package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Order;
import jakarta.validation.constraints.NotNull;

public class AdminOrderStatusUpdateRequest {

    @NotNull
    private Order.OrderEstado estado;

    public Order.OrderEstado getEstado() {
        return estado;
    }

    public void setEstado(Order.OrderEstado estado) {
        this.estado = estado;
    }
}
