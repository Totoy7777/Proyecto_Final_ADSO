package com.proyecto_final.tienda_adso.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CheckoutRequest {

    @NotNull
    private Integer userId;

    @NotBlank
    @Size(max = 120)
    private String shippingName;

    @NotBlank
    @Size(max = 255)
    private String shippingAddress;

    @Size(max = 120)
    private String shippingCity;

    @Size(max = 40)
    private String shippingPhone;

    @Size(max = 255)
    private String notes;

    @NotNull
    @Valid
    private PaymentRequest payment;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getShippingName() {
        return shippingName;
    }

    public void setShippingName(String shippingName) {
        this.shippingName = shippingName;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShippingCity() {
        return shippingCity;
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = shippingCity;
    }

    public String getShippingPhone() {
        return shippingPhone;
    }

    public void setShippingPhone(String shippingPhone) {
        this.shippingPhone = shippingPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public PaymentRequest getPayment() {
        return payment;
    }

    public void setPayment(PaymentRequest payment) {
        this.payment = payment;
    }

    public static class PaymentRequest {

        @NotBlank
        private String method;

        @Size(max = 80)
        private String pseEntity;

        @Size(max = 40)
        private String walletPhone;

        @Size(max = 120)
        private String cardHolder;

        @Size(max = 30)
        private String cardNumber;

        @Size(max = 10)
        private String cardExpiration;

        @Size(max = 4)
        private String cardCvv;

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public String getPseEntity() {
            return pseEntity;
        }

        public void setPseEntity(String pseEntity) {
            this.pseEntity = pseEntity;
        }

        public String getWalletPhone() {
            return walletPhone;
        }

        public void setWalletPhone(String walletPhone) {
            this.walletPhone = walletPhone;
        }

        public String getCardHolder() {
            return cardHolder;
        }

        public void setCardHolder(String cardHolder) {
            this.cardHolder = cardHolder;
        }

        public String getCardNumber() {
            return cardNumber;
        }

        public void setCardNumber(String cardNumber) {
            this.cardNumber = cardNumber;
        }

        public String getCardExpiration() {
            return cardExpiration;
        }

        public void setCardExpiration(String cardExpiration) {
            this.cardExpiration = cardExpiration;
        }

        public String getCardCvv() {
            return cardCvv;
        }

        public void setCardCvv(String cardCvv) {
            this.cardCvv = cardCvv;
        }
    }
}
