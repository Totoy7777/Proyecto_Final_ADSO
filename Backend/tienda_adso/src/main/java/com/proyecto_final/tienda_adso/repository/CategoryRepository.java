package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findAllByNameIgnoreCase(String name);
}
