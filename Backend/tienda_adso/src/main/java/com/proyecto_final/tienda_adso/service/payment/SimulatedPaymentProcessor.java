package com.proyecto_final.tienda_adso.service.payment;

import com.proyecto_final.tienda_adso.dto.CheckoutRequest;
import com.proyecto_final.tienda_adso.model.Payment;
import com.proyecto_final.tienda_adso.model.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Random;

@Service
public class SimulatedPaymentProcessor implements PaymentProcessor {

    private static final Random RANDOM = new Random();

    @Override
    public PaymentResult process(User user,
                                 BigDecimal amount,
                                 CheckoutRequest.PaymentRequest paymentRequest) {
        if (paymentRequest == null) {
            throw new IllegalArgumentException("Debe seleccionar un método de pago válido");
        }
        String rawMethod = paymentRequest.getMethod();
        if (!StringUtils.hasText(rawMethod)) {
            throw new IllegalArgumentException("El método de pago es obligatorio");
        }

        String method = rawMethod.trim().toUpperCase(Locale.ROOT);
        return switch (method) {
            case "TARJETA_CREDITO", "TARJETA_DEBITO" -> simulateCardPayment(user, amount, paymentRequest, method);
            case "PSE_NEQUI", "PSE", "NEQUI" -> simulatePsePayment(user, amount, paymentRequest, method);
            default -> simulateGenericPayment(user, amount, paymentRequest, method);
        };
    }

    private PaymentResult simulateCardPayment(User user,
                                              BigDecimal amount,
                                              CheckoutRequest.PaymentRequest paymentRequest,
                                              String method) {
        String cardNumber = normalize(paymentRequest.getCardNumber());
        String holder = normalize(paymentRequest.getCardHolder());
        String expiration = normalize(paymentRequest.getCardExpiration());
        String cvv = normalize(paymentRequest.getCardCvv());

        if (!StringUtils.hasText(cardNumber) || cardNumber.length() < 12) {
            throw new IllegalArgumentException("El número de la tarjeta no es válido");
        }
        if (!isValidLuhn(cardNumber)) {
            throw new IllegalArgumentException("No pudimos autorizar la tarjeta indicada");
        }
        if (!StringUtils.hasText(holder)) {
            throw new IllegalArgumentException("El titular de la tarjeta es obligatorio");
        }
        if (!StringUtils.hasText(expiration) || expiration.length() != 5 || expiration.charAt(2) != '/') {
            throw new IllegalArgumentException("La fecha de vencimiento debe tener el formato MM/AA");
        }
        if (!StringUtils.hasText(cvv) || cvv.length() < 3) {
            throw new IllegalArgumentException("El CVV ingresado no es válido");
        }

        String last4 = cardNumber.substring(cardNumber.length() - 4);
        String reference = buildReference("CARD");
        String details = "holder=" + holder + ";card=****" + last4;

        return new PaymentResult(
                true,
                Payment.EstadoPago.APROBADO,
                method,
                reference,
                details,
                LocalDateTime.now()
        );
    }

    private PaymentResult simulatePsePayment(User user,
                                             BigDecimal amount,
                                             CheckoutRequest.PaymentRequest paymentRequest,
                                             String method) {
        String pseEntity = normalize(paymentRequest.getPseEntity());
        String walletPhone = normalize(paymentRequest.getWalletPhone());
        if (!StringUtils.hasText(pseEntity) && !StringUtils.hasText(walletPhone)) {
            throw new IllegalArgumentException("Debes indicar la entidad o el número de teléfono asociado");
        }

        String reference = buildReference("PSE");
        StringBuilder details = new StringBuilder();
        if (StringUtils.hasText(pseEntity)) {
            details.append("pse=").append(pseEntity);
        }
        if (StringUtils.hasText(walletPhone)) {
            if (details.length() > 0) {
                details.append(';');
            }
            String masked = walletPhone.length() > 4
                    ? "***" + walletPhone.substring(walletPhone.length() - 4)
                    : walletPhone;
            details.append("wallet=").append(masked);
        }

        return new PaymentResult(
                true,
                Payment.EstadoPago.APROBADO,
                method,
                reference,
                details.toString(),
                LocalDateTime.now()
        );
    }

    private PaymentResult simulateGenericPayment(User user,
                                                 BigDecimal amount,
                                                 CheckoutRequest.PaymentRequest paymentRequest,
                                                 String method) {
        String reference = buildReference(method);
        return new PaymentResult(
                true,
                Payment.EstadoPago.APROBADO,
                method,
                reference,
                "method=" + method,
                LocalDateTime.now()
        );
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String buildReference(String prefix) {
        String clean = prefix.replaceAll("[^A-Z0-9]", "");
        int random = 100000 + RANDOM.nextInt(900000);
        return (clean.isEmpty() ? "PAY" : clean) + "-SIM-" + random;
    }

    private boolean isValidLuhn(String number) {
        int sum = 0;
        boolean alternate = false;
        for (int i = number.length() - 1; i >= 0; i--) {
            char ch = number.charAt(i);
            if (!Character.isDigit(ch)) {
                return false;
            }
            int n = ch - '0';
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n -= 9;
                }
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }
}
