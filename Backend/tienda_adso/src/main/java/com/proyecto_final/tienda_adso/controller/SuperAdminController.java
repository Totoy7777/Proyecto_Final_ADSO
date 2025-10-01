package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.AdminStatusUpdateRequest;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import com.proyecto_final.tienda_adso.dto.UserSummaryDTO;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class SuperAdminController {

    private final UserService userService;

    public SuperAdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserSummaryDTO>> listUsers() {
        List<UserSummaryDTO> users = userService.findAll().stream()
                .map(user -> new UserSummaryDTO(
                        user.getUserId(),
                        user.getNombre(),
                        user.getEmail(),
                        userService.isAdmin(user),
                        userService.isSuperAdmin(user)
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{userId}/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SimpleResponse> updateAdminStatus(@PathVariable int userId,
                                                            @Valid @RequestBody AdminStatusUpdateRequest request) {
        boolean targetAdmin = Boolean.TRUE.equals(request.getAdmin());
        try {
            userService.updateAdminStatus(userId, targetAdmin);
            String message = targetAdmin
                    ? "El usuario ahora tiene permisos de administrador"
                    : "El usuario ya no tiene permisos de administrador";
            return ResponseEntity.ok(new SimpleResponse(true, message));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SimpleResponse(false, ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, ex.getMessage()));
        }
    }
}
