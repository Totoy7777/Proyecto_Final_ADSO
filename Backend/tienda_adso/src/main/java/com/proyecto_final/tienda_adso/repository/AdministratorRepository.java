package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdministratorRepository extends JpaRepository<Administrator, Integer> {
    boolean existsByUser_UserId(int userId);
    Optional<Administrator> findByUser_UserId(int userId);
    void deleteByUser_UserId(int userId);
}
