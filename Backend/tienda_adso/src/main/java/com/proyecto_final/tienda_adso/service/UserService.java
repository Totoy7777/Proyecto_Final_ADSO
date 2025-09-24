package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User save(User user) { return userRepository.save(user); }
    public List<User> findAll() { return userRepository.findAll(); }
    public Optional<User> findById(int id) { return userRepository.findById(id); }
    public void delete(int id) { userRepository.deleteById(id); }

    public Optional<User> login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPasswordHash().equals(password));
    }
}
