package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.AdministratorRepository;
import com.proyecto_final.tienda_adso.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdministratorRepository administratorRepository;

    public DatabaseUserDetailsService(UserRepository userRepository,
                                      AdministratorRepository administratorRepository) {
        this.userRepository = userRepository;
        this.administratorRepository = administratorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedEmail = normalizeEmail(username);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("No existe un usuario con ese correo"));

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        if (administratorRepository.existsByUser_UserId(user.getUserId())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException("El correo es obligatorio");
        }
        return email.trim().toLowerCase();
    }
}
