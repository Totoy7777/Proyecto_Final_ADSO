package com.proyecto_final.tienda_adso.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonProperty(value = "password", access = JsonProperty.Access.WRITE_ONLY)
    @JsonAlias("passwordHash")
    private String passwordHash;

    private String direccion;
    private String telefono;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "reset_code")
    @JsonIgnore
    private String resetCode;

    @Column(name = "reset_code_expires_at")
    @JsonIgnore
    private LocalDateTime resetCodeExpiresAt;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Cart> carts;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Order> orders;


    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public String getResetCode() { return resetCode; }
    public void setResetCode(String resetCode) { this.resetCode = resetCode; }

    public LocalDateTime getResetCodeExpiresAt() { return resetCodeExpiresAt; }
    public void setResetCodeExpiresAt(LocalDateTime resetCodeExpiresAt) { this.resetCodeExpiresAt = resetCodeExpiresAt; }
}
