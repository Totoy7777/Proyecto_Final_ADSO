package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.OrderItem;
import com.proyecto_final.tienda_adso.model.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {}
