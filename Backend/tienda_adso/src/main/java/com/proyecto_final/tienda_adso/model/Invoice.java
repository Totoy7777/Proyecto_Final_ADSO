package com.proyecto_final.tienda_adso.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private int invoiceId;

    @OneToOne
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    @JsonIgnore
    private Order order;

    @Column(unique = true, length = 50)
    private String numero;

    @Column(name = "fecha_emision", insertable = false, updatable = false)
    private LocalDateTime fechaEmision;

    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "url_xml")
    private String urlXml;

    @Column(name = "url_pdf")
    private String urlPdf;

    // Getters and Setters
    public int getInvoiceId() { return invoiceId; }
    public void setInvoiceId(int invoiceId) { this.invoiceId = invoiceId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getUrlXml() { return urlXml; }
    public void setUrlXml(String urlXml) { this.urlXml = urlXml; }

    public String getUrlPdf() { return urlPdf; }
    public void setUrlPdf(String urlPdf) { this.urlPdf = urlPdf; }
}
