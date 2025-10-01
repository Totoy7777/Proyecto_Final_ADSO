package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.RegisterRequest;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.UserService;
import com.proyecto_final.tienda_adso.service.PasswordResetService;
import com.proyecto_final.tienda_adso.service.PasswordResetService.VerificationStatus;
import com.proyecto_final.tienda_adso.dto.AuthResponse; // <-- Nuevo DTO para no exponer password
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class UserController {

    private final UserService userService; // <-- Inyección por constructor
    private final PasswordResetService passwordResetService;

    public UserController(UserService userService, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setNombre(request.getNombre());
            user.setEmail(request.getEmail());
            user.setPasswordHash(request.getPassword());
            user.setDireccion(request.getDireccion());
            user.setTelefono(request.getTelefono());

            User savedUser = userService.save(user);
            boolean isAdmin = userService.isAdmin(savedUser);
            boolean isSuperAdmin = userService.isSuperAdmin(savedUser);
            String message = "Usuario registrado con éxito";

            return ResponseEntity.ok(new AuthResponse(
                    true,
                    message,
                    savedUser.getNombre(),
                    savedUser.getEmail(),
                    savedUser.getUserId(),
                    isAdmin,
                    isSuperAdmin
            ));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(false, ex.getMessage(), null, null, null, false, false));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(false, ex.getMessage(), null, null, null, false, false));
        }
    }

    @PostMapping("/reset-code")
    public ResponseEntity<SimpleResponse> requestResetCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            passwordResetService.sendVerificationCode(email);
            return ResponseEntity.ok(new SimpleResponse(true, "Código enviado al correo registrado"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SimpleResponse(false, ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SimpleResponse(false, ex.getMessage()));
        }
    }

    @PostMapping("/reset-code/verify")
    public ResponseEntity<SimpleResponse> verifyResetCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        VerificationStatus status = passwordResetService.verifyCode(email, code);
        return switch (status) {
            case SUCCESS -> ResponseEntity.ok(new SimpleResponse(true, "Código verificado correctamente"));
            case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SimpleResponse(false, "No existe una cuenta con ese correo"));
            case CODE_NOT_REQUESTED -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "No se ha solicitado un código para este correo"));
            case CODE_EXPIRED -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "El código ha expirado, solicita uno nuevo"));
            case INVALID_CODE -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "El código ingresado no es válido"));
        };
    }

    @PostMapping("/reset-password")
    public ResponseEntity<SimpleResponse> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        String newPassword = payload.get("newPassword");

        try {
            VerificationStatus status = passwordResetService.resetPassword(email, code, newPassword);
            if (status == VerificationStatus.SUCCESS) {
                return ResponseEntity.ok(new SimpleResponse(true, "Contraseña actualizada exitosamente"));
            }

            return switch (status) {
                case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new SimpleResponse(false, "No existe una cuenta con ese correo"));
                case CODE_NOT_REQUESTED -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SimpleResponse(false, "Solicita un código de verificación antes de restablecer"));
                case CODE_EXPIRED -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SimpleResponse(false, "El código ha expirado, solicita uno nuevo"));
                case INVALID_CODE -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SimpleResponse(false, "El código ingresado no es válido"));
                case SUCCESS -> ResponseEntity.ok(new SimpleResponse(true, "Contraseña actualizada exitosamente"));
            };
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        Optional<User> user = userService.login(email, password);

        if (user.isPresent()) {
            User u = user.get();
            boolean isAdmin = userService.isAdmin(u);
            boolean isSuperAdmin = userService.isSuperAdmin(u);
            return ResponseEntity.ok(new AuthResponse(
                    true,
                    "Login exitoso",
                    u.getNombre(),
                    u.getEmail(),
                    u.getUserId(),
                    isAdmin,
                    isSuperAdmin
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(false, "Credenciales inválidas", null, null, null, false, false));
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
                        u.getEmail(),
                        u.getUserId(),
                        userService.isAdmin(u),
                        userService.isSuperAdmin(u)
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
