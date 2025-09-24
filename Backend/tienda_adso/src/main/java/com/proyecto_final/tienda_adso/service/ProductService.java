package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Product;
import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product save(Product p) { return productRepository.save(p); }
    public List<Product> findAll() { return productRepository.findAll(); }
    public Optional<Product> findById(int id) { return productRepository.findById(id); }
    public void delete(int id) { productRepository.deleteById(id); }

    public List<Product> findByCategory(Category category) {
        return productRepository.findByCategory(category);
    }
}
