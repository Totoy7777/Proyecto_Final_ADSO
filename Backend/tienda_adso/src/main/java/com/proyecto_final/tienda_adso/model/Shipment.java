package com.proyecto_final.tienda_adso.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipping_id")
    private int shippingId;

    @OneToOne
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "direccion_envio")
    private String direccionEnvio;

    @Column(name = "nombre_destinatario")
    private String nombreDestinatario;

    @Column(name = "telefono_contacto")
    private String telefonoContacto;

    @Column(name = "notas_envio")
    private String notasEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_envio")
    private EstadoEnvio estadoEnvio = EstadoEnvio.LISTO;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(length = 100)
    private String tracking;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("registradoEn ASC")
    private List<ShipmentEvent> eventos = new ArrayList<>();

    public enum EstadoEnvio { LISTO, ENVIADO, ENTREGADO, DEVUELTO }

    // Getters and Setters
    public int getShippingId() { return shippingId; }
    public void setShippingId(int shippingId) { this.shippingId = shippingId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }

    public String getNombreDestinatario() { return nombreDestinatario; }
    public void setNombreDestinatario(String nombreDestinatario) { this.nombreDestinatario = nombreDestinatario; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    public String getNotasEnvio() { return notasEnvio; }
    public void setNotasEnvio(String notasEnvio) { this.notasEnvio = notasEnvio; }

    public EstadoEnvio getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(EstadoEnvio estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public String getTracking() { return tracking; }
    public void setTracking(String tracking) { this.tracking = tracking; }

    public List<ShipmentEvent> getEventos() { return eventos; }
    public void setEventos(List<ShipmentEvent> eventos) { this.eventos = eventos; }

    public void addEvento(ShipmentEvent evento) {
        if (evento == null) {
            return;
        }
        evento.setShipment(this);
        this.eventos.add(evento);
    }
}
