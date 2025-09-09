package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<usuario, Integer> {
  usuario findByNombreAndPassword(String nombre, String password);
    
}
