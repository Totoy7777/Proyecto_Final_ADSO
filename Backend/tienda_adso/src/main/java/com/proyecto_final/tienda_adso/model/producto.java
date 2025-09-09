package com.proyecto_final.tienda_adso.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "productos")

public class producto {
    @Id
    private long id;

    @Column(name = "nombre", nullable = false, length = 120)
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no debe superar los 120 caracteres")
    private String nombre;

    @Column(name = "precio", nullable = false, precision = 12, scale = 2)
    @NotNull(message = "el precio es obligatorio")
    @DecimalMin(value = "0.00", inclusive = true, message = "El precio no puede ser negativo")
    @Digits(integer = 10, fraction = 2, message = "El precio debe tener como máximo 10 enteros y 2 decimales")
    private BigDecimal precio;

    @Column(name = "stock", nullable = false)
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "imagen_url", length = 255)
    @Size(max = 255, message = "La URL de la imagen no debe superar los 255 caracteres")
    private String imagenUrl;

    @Column(name = "Creado_en", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @Column(name = "Actualizado_en", nullable = false)
    private LocalDateTime updateAt;

    public producto() {

    }

    public producto(String nombre, BigDecimal precio, Integer stock) {

        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.activo = true;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createAt = LocalDateTime.now();
        this.updateAt = this.createAt;
        if (this.activo == null)
            this.activo = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateAt = LocalDateTime.now();
    }

}
