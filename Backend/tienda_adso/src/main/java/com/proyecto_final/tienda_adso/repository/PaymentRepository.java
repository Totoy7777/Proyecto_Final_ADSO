package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {}
