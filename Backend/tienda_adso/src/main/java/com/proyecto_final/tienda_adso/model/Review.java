package com.proyecto_final.tienda_adso.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private int reviewId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private Integer puntuacion;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "respuesta_admin", columnDefinition = "TEXT")
    private String respuestaAdmin;

    @Column(name = "respuesta_fecha")
    private LocalDateTime respuestaFecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "respuesta_admin_user_id")
    @JsonIgnore
    private User respuestaAdminUser;

    @PrePersist
    public void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    // Getters and setters
    public int getReviewId() {
        return reviewId;
    }

    public void setReviewId(int reviewId) {
        this.reviewId = reviewId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getRespuestaAdmin() {
        return respuestaAdmin;
    }

    public void setRespuestaAdmin(String respuestaAdmin) {
        this.respuestaAdmin = respuestaAdmin;
    }

    public LocalDateTime getRespuestaFecha() {
        return respuestaFecha;
    }

    public void setRespuestaFecha(LocalDateTime respuestaFecha) {
        this.respuestaFecha = respuestaFecha;
    }

    public User getRespuestaAdminUser() {
        return respuestaAdminUser;
    }

    public void setRespuestaAdminUser(User respuestaAdminUser) {
        this.respuestaAdminUser = respuestaAdminUser;
    }
}
