package com.proyecto_final.tienda_adso.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private int paymentId;

    @OneToOne
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    private Order order;

    @Column(name = "metodo_pago", length = 40)
    private String metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago")
    private EstadoPago estadoPago = EstadoPago.PENDIENTE;

    @Column(precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "referencia_tx", length = 100)
    private String referenciaTx;

    @Column(name = "detalles_pago", columnDefinition = "TEXT")
    private String detallesPago;

    public enum EstadoPago { PENDIENTE, APROBADO, FALLIDO }

    // Getters and Setters
    public int getPaymentId() { return paymentId; }
    public void setPaymentId(int paymentId) { this.paymentId = paymentId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public EstadoPago getEstadoPago() { return estadoPago; }
    public void setEstadoPago(EstadoPago estadoPago) { this.estadoPago = estadoPago; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getReferenciaTx() { return referenciaTx; }
    public void setReferenciaTx(String referenciaTx) { this.referenciaTx = referenciaTx; }

    public String getDetallesPago() { return detallesPago; }
    public void setDetallesPago(String detallesPago) { this.detallesPago = detallesPago; }
}
