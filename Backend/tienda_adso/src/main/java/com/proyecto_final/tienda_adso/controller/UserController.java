package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.UserService;
import com.proyecto_final.tienda_adso.dto.AuthResponse; // <-- Nuevo DTO para no exponer password
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService; // <-- Inyección por constructor

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/api/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        // ⚠️ En producción: encriptar contraseña con BCrypt
        User savedUser = userService.save(user);

        // Devolvemos DTO en lugar de la entidad completa
        return ResponseEntity.ok(new AuthResponse(
                true,
                "Usuario registrado con éxito",
                savedUser.getNombre(),
                savedUser.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        Optional<User> user = userService.login(email, password);

        if (user.isPresent()) {
            User u = user.get();
            return ResponseEntity.ok(new AuthResponse(
                    true,
                    "Login exitoso",
                    u.getNombre(),
                    u.getEmail()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(false, "Credenciales inválidas", null, null));
    }

    @GetMapping
    public ResponseEntity<List<User>> all() {
        List<User> users = userService.findAll();
        // Podrías mapear a DTO si no quieres exponer passwords
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable int id) {
        return userService.findById(id)
                .map(u -> ResponseEntity.ok(new AuthResponse(
                        true,
                        "Usuario encontrado",
                        u.getNombre(),
                        u.getEmail()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (userService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build(); // <-- Validación añadida
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
