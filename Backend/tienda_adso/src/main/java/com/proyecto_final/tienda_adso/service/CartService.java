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
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (product.getStock() == null || product.getStock() <= 0) {
            throw new IllegalStateException("Producto sin stock disponible");
        }

        CartItemId id = new CartItemId(cart.getCartId(), productId);
        CartItem item = cartItemRepository.findById(id).orElse(null);
        int nuevaCantidad = cantidad;
        if (item == null) {
            item = new CartItem();
            item.setId(id);
            item.setCart(cart);
            item.setProduct(product);
        } else {
            nuevaCantidad = item.getCantidad() + cantidad;
        }

        if (nuevaCantidad > product.getStock()) {
            throw new IllegalArgumentException("La cantidad solicitada supera el stock disponible");
        }

        item.setCantidad(nuevaCantidad);
        item.setPrecioUnitario(product.getPrice());
        cartItemRepository.save(item);
        return cartRepository.findById(cart.getCartId()).orElse(cart);
    }

    @Transactional
    public void removeItem(Cart cart, int productId) {
        cartItemRepository.deleteById(new CartItemId(cart.getCartId(), productId));
    }

    @Transactional
    public Cart updateItemQuantity(Cart cart, int productId, int cantidad) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        CartItemId id = new CartItemId(cart.getCartId(), productId);
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El producto no está en el carrito"));

        if (cantidad <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (cantidad > product.getStock()) {
                throw new IllegalArgumentException("La cantidad solicitada supera el stock disponible");
            }
            item.setCantidad(cantidad);
            item.setPrecioUnitario(product.getPrice());
            cartItemRepository.save(item);
        }

        return cartRepository.findById(cart.getCartId()).orElse(cart);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cartItemRepository.deleteAll(cart.getItems());
        cart.setEstado(Cart.CartEstado.CERRADO);
        cartRepository.save(cart);
    }

    public java.math.BigDecimal calculateTotal(Cart cart) {
        if (cart.getItems() == null) {
            return java.math.BigDecimal.ZERO;
        }
        return cart.getItems().stream()
                .map(item -> item.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(item.getCantidad())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }
}
