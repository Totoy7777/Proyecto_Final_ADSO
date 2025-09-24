package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.CartItem;
import com.proyecto_final.tienda_adso.model.CartItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {}
