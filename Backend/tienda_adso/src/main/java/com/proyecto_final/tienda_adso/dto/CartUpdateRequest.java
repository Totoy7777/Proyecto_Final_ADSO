package com.proyecto_final.tienda_adso.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CartUpdateRequest {

    @NotNull
    private Integer userId;

    @NotNull
    private Integer productId;

    /**
     * Nueva cantidad deseada para el ítem. Si es 0 se elimina.
     */
    @NotNull
    @Min(0)
    private Integer cantidad;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
