package com.proyecto_final.tienda_adso.model;

import jakarta.persistence.*;

@Entity
@Table(name = "super_administrators")
public class SuperAdministrator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "super_admin_id")
    private int superAdminId;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    public int getSuperAdminId() {
        return superAdminId;
    }

    public void setSuperAdminId(int superAdminId) {
        this.superAdminId = superAdminId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
