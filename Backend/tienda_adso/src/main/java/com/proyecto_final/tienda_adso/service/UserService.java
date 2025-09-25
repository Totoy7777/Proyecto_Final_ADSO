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
        // 📝 defensivo: quita espacios y normaliza email a lower-case
        String e = email == null ? null : email.trim().toLowerCase();
        String p = password == null ? null : password; // no trim del pass

        Optional<User> ou = userRepository.findByEmail(e);

        // 🔎 log temporal para depurar (borra luego)
        ou.ifPresent(u -> System.out.println(
            "DBG login: email=[" + e + "] dbPwd=[" + u.getPasswordHash() + "] inPwd=[" + p + "] equals=" + u.getPasswordHash().equals(p)));

        return ou.filter(u -> u.getPasswordHash().equals(p));
    }
}
