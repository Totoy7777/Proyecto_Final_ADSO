package com.proyecto_final.tienda_adso.dto;

import jakarta.validation.constraints.NotNull;

public class AdminStatusUpdateRequest {

    @NotNull
    private Boolean admin;

    public Boolean getAdmin() {
        return admin;
    }

    public void setAdmin(Boolean admin) {
        this.admin = admin;
    }
}
