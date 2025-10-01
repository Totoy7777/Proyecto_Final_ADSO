package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.SuperAdministrator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuperAdministratorRepository extends JpaRepository<SuperAdministrator, Integer> {
    boolean existsByUser_UserId(int userId);
    Optional<SuperAdministrator> findByUser_UserId(int userId);
}
