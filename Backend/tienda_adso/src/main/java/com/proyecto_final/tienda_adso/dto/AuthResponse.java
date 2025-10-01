package com.proyecto_final.tienda_adso.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String nombre;
    private String email;
    private Integer userId;
    private boolean admin;
    private boolean superAdmin;

    public AuthResponse(boolean success,
                        String message,
                        String nombre,
                        String email,
                        Integer userId,
                        boolean admin,
                        boolean superAdmin) {
        this.success = success;
        this.message = message;
        this.nombre = nombre;
        this.email = email;
        this.userId = userId;
        this.admin = admin;
        this.superAdmin = superAdmin;
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

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public boolean isAdmin() { return admin; }
    public void setAdmin(boolean admin) { this.admin = admin; }

    public boolean isSuperAdmin() { return superAdmin; }
    public void setSuperAdmin(boolean superAdmin) { this.superAdmin = superAdmin; }
}
