package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Cart;
import com.proyecto_final.tienda_adso.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findFirstByUserAndEstado(User user, Cart.CartEstado estado);
    List<Cart> findByUser(User user);
}
