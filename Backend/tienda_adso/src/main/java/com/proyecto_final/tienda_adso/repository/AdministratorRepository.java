package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministratorRepository extends JpaRepository<Administrator, Integer> {
    boolean existsByUser_UserId(int userId);
}
