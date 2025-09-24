package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Product;
import com.proyecto_final.tienda_adso.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByCategory(Category category);
}
