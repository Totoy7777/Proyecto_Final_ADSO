package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.OrderService;
import com.proyecto_final.tienda_adso.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private UserService userService;

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<Order>> byUser(@PathVariable int userId) {
        User user = userService.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(orderService.findByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> byId(@PathVariable int id) {
        try {
            return ResponseEntity.ok(orderService.findById(id));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
