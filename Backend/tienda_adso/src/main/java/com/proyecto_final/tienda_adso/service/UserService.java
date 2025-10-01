package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Administrator;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.AdministratorRepository;
import com.proyecto_final.tienda_adso.repository.SuperAdministratorRepository;
import com.proyecto_final.tienda_adso.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdministratorRepository administratorRepository;
    private final SuperAdministratorRepository superAdministratorRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AdministratorRepository administratorRepository,
                       SuperAdministratorRepository superAdministratorRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.administratorRepository = administratorRepository;
        this.superAdministratorRepository = superAdministratorRepository;
    }

    public User save(User user) {
        return persistUser(user);
    }

    private User persistUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("El usuario no puede ser null");
        }

        String normalizedEmail = Optional.ofNullable(user.getEmail())
                .map(String::trim)
                .map(String::toLowerCase)
                .orElseThrow(() -> new IllegalArgumentException("El correo es obligatorio"));

        userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
            throw new DataIntegrityViolationException("El correo ya se encuentra registrado");
        });

        String rawPassword = user.getPasswordHash();
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }

        user.setEmail(normalizedEmail);
        user.setPasswordHash(encodeIfNeeded(rawPassword));

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new DataIntegrityViolationException("El correo ya se encuentra registrado", ex);
        }
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    public void delete(int id) {
        userRepository.deleteById(id);
    }

    public Optional<User> login(String email, String password) {
        if (email == null || password == null) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()));
    }

    public boolean isAdmin(User user) {
        if (user == null) {
            return false;
        }
        return administratorRepository.existsByUser_UserId(user.getUserId())
                || isSuperAdmin(user);
    }

    public boolean isSuperAdmin(User user) {
        if (user == null) {
            return false;
        }
        return superAdministratorRepository.existsByUser_UserId(user.getUserId());
    }

    @Transactional
    public void updateAdminStatus(int userId, boolean grantAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("No existe un usuario con ese id"));

        boolean alreadyAdmin = administratorRepository.existsByUser_UserId(userId);
        boolean isSuperAdmin = isSuperAdmin(user);

        if (isSuperAdmin && !grantAdmin) {
            throw new IllegalStateException("No se pueden revocar los permisos de un super administrador");
        }

        if (grantAdmin) {
            if (!alreadyAdmin) {
                Administrator administrator = new Administrator();
                administrator.setUser(user);
                administratorRepository.save(administrator);
            }
            return;
        }

        if (alreadyAdmin) {
            administratorRepository.deleteByUser_UserId(userId);
        }
    }

    private String encodeIfNeeded(String password) {
        String trimmed = password.trim();
        if (trimmed.startsWith("$2a$") || trimmed.startsWith("$2b$") || trimmed.startsWith("$2y$")) {
            return trimmed;
        }
        return passwordEncoder.encode(trimmed);
    }
}
