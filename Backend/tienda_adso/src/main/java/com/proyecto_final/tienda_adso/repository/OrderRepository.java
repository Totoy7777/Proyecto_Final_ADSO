package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser(User user);
}
