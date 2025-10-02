package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.AdminOrderStatusUpdateRequest;
import com.proyecto_final.tienda_adso.dto.AdminPaymentUpdateRequest;
import com.proyecto_final.tienda_adso.dto.AdminShipmentUpdateRequest;
import com.proyecto_final.tienda_adso.dto.AdminShipmentEventRequest;
import com.proyecto_final.tienda_adso.model.Order;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import com.proyecto_final.tienda_adso.repository.OrderItemRepository;
import com.proyecto_final.tienda_adso.service.OrderService;
import com.proyecto_final.tienda_adso.dto.admin.AdminOrderDTO;
import com.proyecto_final.tienda_adso.dto.admin.AdminOrderMapper;
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
    public ResponseEntity<List<AdminOrderDTO>> listAll() {
        List<Order> orders = orderService.findAllWithDetails();
        return ResponseEntity.ok(orders.stream().map(AdminOrderMapper::toDTO).toList());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDTO> getOne(@PathVariable int orderId) {
        try {
            Order order = orderService.findById(orderId);
            return ResponseEntity.ok(AdminOrderMapper.toDTO(order));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{orderId}/payment")
    public ResponseEntity<?> updatePayment(@PathVariable int orderId,
                                            @Valid @RequestBody AdminPaymentUpdateRequest request) {
        try {
            Order updated = orderService.updatePaymentStatus(orderId,
                    request.getEstado(), request.getReferencia(), request.getDetalles());
            return ResponseEntity.ok(AdminOrderMapper.toDTO(updated));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(new SimpleResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new SimpleResponse(false, "Error interno del servidor: " + (ex.getMessage() != null ? ex.getMessage() : "ver logs")));
        }
    }

    @PatchMapping("/{orderId}/shipment")
    public ResponseEntity<?> updateShipment(@PathVariable int orderId,
                                                @Valid @RequestBody AdminShipmentUpdateRequest request) {
        try {
            Order updated = orderService.updateShipmentStatus(orderId,
                    request.getEstado(), request.getTracking(), request.getNotas(), request.getFechaEnvio());
            return ResponseEntity.ok(AdminOrderMapper.toDTO(updated));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(new SimpleResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new SimpleResponse(false, "Error interno del servidor: " + (ex.getMessage() != null ? ex.getMessage() : "ver logs")));
        }
    }

    @PostMapping("/{orderId}/shipment/events")
    public ResponseEntity<?> addShipmentEvent(@PathVariable int orderId,
                                                  @Valid @RequestBody AdminShipmentEventRequest request) {
        try {
            Order updated = orderService.addShipmentEvent(orderId,
                    request.getEstado(), request.getMensaje(), request.getFecha());
            return ResponseEntity.ok(AdminOrderMapper.toDTO(updated));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(new SimpleResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new SimpleResponse(false, "Error interno del servidor: " + (ex.getMessage() != null ? ex.getMessage() : "ver logs")));
        }
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int orderId,
                                              @Valid @RequestBody AdminOrderStatusUpdateRequest request) {
        try {
            Order updated = orderService.updateOrderStatus(orderId, request.getEstado());
            return ResponseEntity.ok(AdminOrderMapper.toDTO(updated));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(new SimpleResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new SimpleResponse(false, "Error interno del servidor: " + (ex.getMessage() != null ? ex.getMessage() : "ver logs")));
        }
    }
}
