package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.OrderItem;
import com.proyecto_final.tienda_adso.model.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    List<OrderItem> findByOrder(Order order);
}
