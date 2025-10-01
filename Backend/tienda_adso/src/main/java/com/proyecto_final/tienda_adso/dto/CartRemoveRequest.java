package com.proyecto_final.tienda_adso.dto;

import jakarta.validation.constraints.NotNull;

public class CartRemoveRequest {

    @NotNull
    private Integer userId;

    @NotNull
    private Integer productId;

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
}
