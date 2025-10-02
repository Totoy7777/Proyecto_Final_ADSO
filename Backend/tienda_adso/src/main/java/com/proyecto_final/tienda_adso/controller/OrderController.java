package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.OrderMapper;
import com.proyecto_final.tienda_adso.dto.OrderSummaryDTO;
import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.OrderService;
import com.proyecto_final.tienda_adso.service.UserService;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderSummaryDTO>> listForUser(@PathVariable int userId,
                                                              Authentication authentication) {
        User user = resolveUser(userId, authentication);
        List<Order> orders = orderService.findByUser(user);
        List<OrderSummaryDTO> summaries = orders.stream()
                .filter(o -> o.getHiddenForUser() == null || !o.getHiddenForUser())
                .map(OrderMapper::toSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderSummaryDTO> detail(@PathVariable int orderId,
                                                   Authentication authentication) {
        Order order = orderService.findById(orderId);
        User user = resolveUser(order.getUser().getUserId(), authentication);
        if (order.getUser().getUserId() != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes consultar esta orden");
        }
        return ResponseEntity.ok(OrderMapper.toSummary(order));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable int orderId, Authentication authentication) {
        Order order = orderService.findById(orderId);
        // Verificar que el solicitante sea el dueño de la orden
        User owner = resolveUser(order.getUser().getUserId(), authentication);
        if (order.getUser().getUserId() != owner.getUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar esta orden");
        }
        orderService.deleteOrder(order);
        return ResponseEntity.ok(new SimpleResponse(true, "Pedido eliminado"));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteAllForUser(@PathVariable int userId, Authentication authentication) {
        User user = resolveUser(userId, authentication);
        int removed = orderService.deleteOrdersByUser(user);
        return ResponseEntity.ok(new SimpleResponse(true, removed + " pedido(s) eliminados"));
    }

    private User resolveUser(int requestedUserId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }
        User user = userService.findById(requestedUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        String principalEmail = authentication.getName();
        if (principalEmail == null || !principalEmail.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para esta información");
        }
        return user;
    }
}
