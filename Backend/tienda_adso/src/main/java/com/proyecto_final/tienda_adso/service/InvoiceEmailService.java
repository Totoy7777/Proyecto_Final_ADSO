package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.OrderItem;
import com.proyecto_final.tienda_adso.model.Payment;
import com.proyecto_final.tienda_adso.model.Shipment;
import com.proyecto_final.tienda_adso.model.ShipmentEvent;
import com.proyecto_final.tienda_adso.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class InvoiceEmailService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@tienda-adso.local}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public InvoiceEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvoice(User user,
                            Order order,
                            Payment payment,
                            Shipment shipment,
                            List<OrderItem> items) {
        if (user == null || order == null) {
            logger.warn("No se envió correo de factura porque faltan datos obligatorios");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Factura de tu compra #" + order.getOrderId());

            StringBuilder body = new StringBuilder();
            NumberFormat currency = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
            body.append("Hola ")
                .append(user.getNombre() != null ? user.getNombre() : "cliente")
                .append(",\n\n")
                .append("Gracias por tu compra en Tienda ADSO. Estos son los detalles de tu orden:\n")
                .append("Orden: ").append(order.getOrderId()).append('\n');

            if (order.getFechaPedido() != null) {
                body.append("Fecha: ")
                    .append(order.getFechaPedido().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .append('\n');
            }

            if (items != null && !items.isEmpty()) {
                body.append("\nProductos:\n");
                for (OrderItem item : items) {
                    String name = item.getProduct() != null ? item.getProduct().getName() : "Producto";
                    BigDecimal lineTotal = item.getPrecioUnitario()
                            .multiply(BigDecimal.valueOf(item.getCantidad()));
                    body.append(" - ")
                        .append(name)
                        .append(" x ")
                        .append(item.getCantidad())
                        .append(" = $")
                        .append(currency.format(lineTotal));
                    body.append('\n');
                }
            }

            body.append("\nTotal pagado: $")
                .append(currency.format(order.getTotal())).append('\n');

            if (payment != null) {
                body.append("Método de pago: ")
                    .append(payment.getMetodoPago())
                    .append(" (estado: ")
                    .append(payment.getEstadoPago())
                    .append(")\n");
                if (payment.getReferenciaTx() != null) {
                    body.append("Referencia: ")
                        .append(payment.getReferenciaTx())
                        .append('\n');
                }
            }

            if (shipment != null) {
                body.append("\nEnvío a nombre de: ")
                    .append(shipment.getNombreDestinatario() != null ? shipment.getNombreDestinatario() : user.getNombre())
                    .append('\n')
                    .append("Dirección: ")
                    .append(shipment.getDireccionEnvio())
                    .append('\n');
                if (shipment.getTelefonoContacto() != null && !shipment.getTelefonoContacto().isBlank()) {
                    body.append("Teléfono: ")
                        .append(shipment.getTelefonoContacto())
                        .append('\n');
                }
                body.append("Estado del envío: ")
                    .append(shipment.getEstadoEnvio())
                    .append('\n');

                List<ShipmentEvent> events = shipment.getEventos();
                if (events != null && !events.isEmpty()) {
                    body.append("\nSeguimiento del envío:\n");
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                    for (ShipmentEvent event : events) {
                        body.append(" - [")
                            .append(event.getRegistradoEn() != null ? event.getRegistradoEn().format(formatter) : "--")
                            .append("] ")
                            .append(event.getEstado() != null ? event.getEstado() : "ACTUALIZACIÓN")
                            .append(": ")
                            .append(event.getMensaje() != null ? event.getMensaje() : "Sin descripción")
                            .append('\n');
                    }
                }
            }

            body.append("\nSi tienes dudas sobre tu pedido responde este correo o comunícate con soporte.\n\n")
                .append("¡Gracias por confiar en nosotros!\n")
                .append("Tienda ADSO");

            message.setText(body.toString());
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            } else if (mailUsername != null && !mailUsername.isBlank()) {
                message.setFrom(mailUsername);
            }

            mailSender.send(message);
        } catch (MailException e) {
            logger.error("No fue posible enviar el correo de factura para la orden {}: {}", order.getOrderId(), e.getMessage());
        }
    }
}
