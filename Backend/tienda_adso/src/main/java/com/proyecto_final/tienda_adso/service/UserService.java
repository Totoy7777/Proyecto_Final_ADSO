package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Administrator;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.AdministratorRepository;
import com.proyecto_final.tienda_adso.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdministratorRepository administratorRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AdministratorRepository administratorRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.administratorRepository = administratorRepository;
    }

    public User save(User user) {
        return save(user, false);
    }

    public User save(User user, boolean createAdmin) {
        User savedUser = persistUser(user);

        if (createAdmin && !administratorRepository.existsByUser_UserId(savedUser.getUserId())) {
            Administrator administrator = new Administrator();
            administrator.setUser(savedUser);
            administratorRepository.save(administrator);
        }

        return savedUser;
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
        return administratorRepository.existsByUser_UserId(user.getUserId());
    }

    private String encodeIfNeeded(String password) {
        String trimmed = password.trim();
        if (trimmed.startsWith("$2a$") || trimmed.startsWith("$2b$") || trimmed.startsWith("$2y$")) {
            return trimmed;
        }
        return passwordEncoder.encode(trimmed);
    }
}
