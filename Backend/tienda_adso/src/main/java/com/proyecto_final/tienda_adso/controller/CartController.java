package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.service.CartService;
import com.proyecto_final.tienda_adso.service.UserService;
import com.proyecto_final.tienda_adso.service.OrderService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<?> addItem(@RequestBody Map<String, String> body) {
        int userId = Integer.parseInt(body.get("userId"));
        int productId = Integer.parseInt(body.get("productId"));
        int cantidad = Integer.parseInt(body.get("cantidad"));

        User user = userService.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElseGet(() -> cartService.createActiveCart(user));
        cart = cartService.addItem(cart, productId, cantidad);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeItem(@RequestBody Map<String, String> body) {
        int userId = Integer.parseInt(body.get("userId"));
        int productId = Integer.parseInt(body.get("productId"));

        User user = userService.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElse(null);
        if (cart == null) return ResponseEntity.badRequest().body("No hay carrito activo");

        cartService.removeItem(cart, productId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> body) {
        int userId = Integer.parseInt(body.get("userId"));
        User user = userService.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no existe");

        Cart cart = cartService.getActiveCart(user).orElse(null);
        if (cart == null) return ResponseEntity.badRequest().body("No hay carrito activo");

        return ResponseEntity.ok(orderService.checkoutFromCart(cart));
    }
}

