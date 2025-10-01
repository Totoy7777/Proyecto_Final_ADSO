package com.proyecto_final.tienda_adso.dto;

public class UserSummaryDTO {

    private final int userId;
    private final String nombre;
    private final String email;
    private final boolean admin;
    private final boolean superAdmin;

    public UserSummaryDTO(int userId, String nombre, String email, boolean admin, boolean superAdmin) {
        this.userId = userId;
        this.nombre = nombre;
        this.email = email;
        this.admin = admin;
        this.superAdmin = superAdmin;
    }

    public int getUserId() {
        return userId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public boolean isAdmin() {
        return admin;
    }

    public boolean isSuperAdmin() {
        return superAdmin;
    }
}
