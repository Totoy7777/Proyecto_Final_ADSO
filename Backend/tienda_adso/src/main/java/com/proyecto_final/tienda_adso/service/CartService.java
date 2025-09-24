package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.Optional;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;

    public Optional<Cart> getActiveCart(User user) {
        return cartRepository.findFirstByUserAndEstado(user, Cart.CartEstado.ACTIVO);
    }

    @Transactional
    public Cart createActiveCart(User user) {
        Cart c = new Cart();
        c.setUser(user);
        c.setEstado(Cart.CartEstado.ACTIVO);
        return cartRepository.save(c);
    }

    @Transactional
    public Cart addItem(Cart cart, int productId, int cantidad) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        CartItemId id = new CartItemId(cart.getCartId(), productId);
        CartItem item = cartItemRepository.findById(id).orElse(null);
        if (item == null) {
            item = new CartItem();
            item.setId(id);
            item.setCart(cart);
            item.setProduct(product);
            item.setCantidad(cantidad);
            item.setPrecioUnitario(product.getPrice());
        } else {
            item.setCantidad(item.getCantidad() + cantidad);
        }
        cartItemRepository.save(item);
        return cartRepository.findById(cart.getCartId()).orElse(cart);
    }

    @Transactional
    public void removeItem(Cart cart, int productId) {
        cartItemRepository.deleteById(new CartItemId(cart.getCartId(), productId));
    }
}
