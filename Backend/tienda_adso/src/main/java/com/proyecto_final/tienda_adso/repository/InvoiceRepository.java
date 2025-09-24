package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {}
