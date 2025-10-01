package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.AdminOrderStatusUpdateRequest;
import com.proyecto_final.tienda_adso.dto.AdminPaymentUpdateRequest;
import com.proyecto_final.tienda_adso.dto.AdminShipmentUpdateRequest;
import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.repository.OrderItemRepository;
import com.proyecto_final.tienda_adso.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
@PreAuthorize("hasRole('ADMIN')")
public class OrderAdminController {

    private final OrderService orderService;
    private final OrderItemRepository orderItemRepository;

    public OrderAdminController(OrderService orderService, OrderItemRepository orderItemRepository) {
        this.orderService = orderService;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<Order>> listAll() {
        List<Order> orders = orderService.findAllWithDetails();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOne(@PathVariable int orderId) {
        try {
            Order order = orderService.findById(orderId);
            order.setItems(orderItemRepository.findByOrder(order));
            return ResponseEntity.ok(order);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{orderId}/payment")
    public ResponseEntity<Order> updatePayment(@PathVariable int orderId,
                                               @Valid @RequestBody AdminPaymentUpdateRequest request) {
        Order updated = orderService.updatePaymentStatus(orderId,
                request.getEstado(), request.getReferencia(), request.getDetalles());
        updated.setItems(orderItemRepository.findByOrder(updated));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{orderId}/shipment")
    public ResponseEntity<Order> updateShipment(@PathVariable int orderId,
                                                @Valid @RequestBody AdminShipmentUpdateRequest request) {
        Order updated = orderService.updateShipmentStatus(orderId,
                request.getEstado(), request.getTracking(), request.getNotas(), request.getFechaEnvio());
        updated.setItems(orderItemRepository.findByOrder(updated));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable int orderId,
                                              @Valid @RequestBody AdminOrderStatusUpdateRequest request) {
        Order updated = orderService.updateOrderStatus(orderId, request.getEstado());
        updated.setItems(orderItemRepository.findByOrder(updated));
        return ResponseEntity.ok(updated);
    }
}
