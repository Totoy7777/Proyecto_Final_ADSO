package com.proyecto_final.tienda_adso.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewResponseRequest {

    @NotBlank(message = "La respuesta no puede estar vacía")
    private String respuesta;

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }
}
