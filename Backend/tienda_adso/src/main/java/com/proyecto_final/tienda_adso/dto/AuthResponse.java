package com.proyecto_final.tienda_adso.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String nombre;
    private String email;

    public AuthResponse(boolean success, String message, String nombre, String email) {
        this.success = success;
        this.message = message;
        this.nombre = nombre;
        this.email = email;
    }

    // Getters y setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
