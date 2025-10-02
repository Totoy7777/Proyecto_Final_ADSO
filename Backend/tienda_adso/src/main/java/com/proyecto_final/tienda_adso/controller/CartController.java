package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.CartAddRequest;
import com.proyecto_final.tienda_adso.dto.CartRemoveRequest;
import com.proyecto_final.tienda_adso.dto.CartUpdateRequest;
import com.proyecto_final.tienda_adso.dto.CheckoutRequest;
import com.proyecto_final.tienda_adso.dto.CheckoutResponse;
import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.service.CartService;
import com.proyecto_final.tienda_adso.service.UserService;
import com.proyecto_final.tienda_adso.service.OrderService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
@Validated
public class CartController {

    @Autowired private CartService cartService;
    @Autowired private UserService userService;
    @Autowired private OrderService orderService;

    @GetMapping("/active/{userId}")
    public ResponseEntity<Cart> getActive(@PathVariable int userId) {
        User user = userService.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return cartService.getActiveCart(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(cartService.createActiveCart(user)));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(@Valid @RequestBody CartAddRequest request) {
        User user = resolveUser(request.getUserId());
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElseGet(() -> cartService.createActiveCart(user));
        cart = cartService.addItem(cart, request.getProductId(), request.getCantidad());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeItem(@Valid @RequestBody CartRemoveRequest request) {
        User user = resolveUser(request.getUserId());
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElse(null);
        if (cart == null) return ResponseEntity.badRequest().body("No hay carrito activo");

        cartService.removeItem(cart, request.getProductId());
        return ResponseEntity.ok(cartService.getActiveCart(user).orElse(cart));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateItem(@Valid @RequestBody CartUpdateRequest request) {
        User user = resolveUser(request.getUserId());
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElse(null);
        if (cart == null) return ResponseEntity.badRequest().body("No hay carrito activo");

        Cart updated = cartService.updateItemQuantity(cart, request.getProductId(), request.getCantidad());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request) {
        User user = resolveUser(request.getUserId());
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElse(null);
        if (cart == null) return ResponseEntity.badRequest().body("No hay carrito activo");
        try {
            CheckoutResponse response = orderService.checkoutFromCart(cart, request);
            // crear nuevo carrito activo para compras futuras
            cartService.createActiveCart(user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    private User resolveUser(Integer userId) {
        if (userId == null) {
            return null;
        }
        return userService.findById(userId).orElse(null);
    }
}
