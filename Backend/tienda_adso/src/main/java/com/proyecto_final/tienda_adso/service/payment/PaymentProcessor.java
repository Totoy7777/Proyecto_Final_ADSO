package com.proyecto_final.tienda_adso.service.payment;

import com.proyecto_final.tienda_adso.dto.CheckoutRequest;
import com.proyecto_final.tienda_adso.model.User;

import java.math.BigDecimal;

public interface PaymentProcessor {

    PaymentResult process(User user, BigDecimal amount, CheckoutRequest.PaymentRequest paymentRequest);
}
