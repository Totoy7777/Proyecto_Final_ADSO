import React, { useMemo } from "react";
import { FaCheckCircle, FaDotCircle } from "react-icons/fa";

const STATUS_LABELS = {
  LISTO: "Listo para envío",
  ENVIADO: "En tránsito",
  ENTREGADO: "Entregado",
  DEVUELTO: "Devuelto",
};

const DEFAULT_MESSAGES = {
  LISTO: "Tu pedido está preparado y pronto saldrá del local.",
  ENVIADO: "El pedido salió del centro de despacho y va camino a tu dirección.",
  ENTREGADO: "Confirmamos la entrega en la dirección indicada.",
  DEVUELTO: "Estamos gestionando la devolución para darte más información.",
};

const formatDateTime = (value) => {
  if (!value) {
    return null;
  }
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString("es-CO");
};

const buildPaymentStep = (payment) => {
  if (!payment || !payment.status) {
    return null;
  }
  const isApproved = payment.status === "APROBADO";
  const descriptionParts = [];
  if (payment.method) {
    descriptionParts.push(`Método: ${payment.method}`);
  }
  if (payment.details) {
    const cleanedDetails = payment.details.replace(/;+$/g, "");
    descriptionParts.push(cleanedDetails);
  }
  const description = descriptionParts.length > 0 ? descriptionParts.join(" · ") : "Pago procesado";

  return {
    key: `payment-${payment.paidAt || payment.status}`,
    title: isApproved ? "Pago confirmado" : "Pago en revisión",
    description,
    timestamp: payment.paidAt,
    completed: isApproved,
  };
};

const buildShipmentSteps = (shipment) => {
  if (!shipment) {
    return [];
  }
  const { events = [], status, notes, tracking, shippedAt } = shipment;
  if (Array.isArray(events) && events.length > 0) {
    return events.map((event, index) => {
      const friendly = STATUS_LABELS[event.status] ?? event.status ?? "Actualización";
      const description = event.message ?? DEFAULT_MESSAGES[event.status] ?? "Seguimiento actualizado";
      return {
        key: `event-${event.eventId ?? `${event.status}-${index}`}`,
        title: friendly,
        description,
        timestamp: event.registeredAt,
        completed: event.status === "ENTREGADO",
      };
    });
  }

  if (status) {
    const summaryParts = [];
    if (notes) {
      summaryParts.push(notes);
    } else {
      summaryParts.push(DEFAULT_MESSAGES[status] ?? "Seguimos procesando tu envío.");
    }
    if (tracking) {
      summaryParts.push(`Guía: ${tracking}`);
    }
    return [
      {
        key: `shipment-${status}`,
        title: STATUS_LABELS[status] ?? status,
        description: summaryParts.join(" · "),
        timestamp: shippedAt,
        completed: status === "ENTREGADO",
      },
    ];
  }

  return [];
};

const OrderShipmentTimeline = ({ payment = null, shipment = null }) => {
  const steps = useMemo(() => {
    const timeline = [];
    const paymentStep = buildPaymentStep(payment);
    if (paymentStep) {
      timeline.push(paymentStep);
    }
    timeline.push(...buildShipmentSteps(shipment));
    return timeline;
  }, [payment, shipment]);

  if (steps.length === 0) {
    return <p className="order-timeline-empty">Aún no hay novedades sobre tu pedido, te avisaremos pronto.</p>;
  }

  return (
    <div className="order-timeline">
      {steps.map((step) => {
        const formattedDate = formatDateTime(step.timestamp);
        return (
          <div key={step.key} className={`order-timeline-step${step.completed ? " completed" : ""}`}>
            <div className="order-timeline-heading">
              {step.completed ? (
                <FaCheckCircle className="order-timeline-icon" />
              ) : (
                <FaDotCircle className="order-timeline-icon" />
              )}
              <div>
                <h4>{step.title}</h4>
                {formattedDate && <div className="order-timeline-time">{formattedDate}</div>}
              </div>
            </div>
            <p>{step.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderShipmentTimeline;
