package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.model.Product;

import com.proyecto_final.tienda_adso.service.ProductService;
import com.proyecto_final.tienda_adso.service.CategoryService;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired private ProductService productService;
    @Autowired private CategoryService categoryService;

    @GetMapping
    public List<Product> all() { return productService.findAll(); }

    @PostMapping
    public Product create(@RequestBody Product p) { return productService.save(p); }

    @GetMapping("/{id}")
    public ResponseEntity<Product> byId(@PathVariable int id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable int id, @RequestBody Product p) {
        return productService.findById(id)
                .map(db -> {
                    db.setName(p.getName());
                    db.setDescription(p.getDescription());
                    db.setPrice(p.getPrice());
                    db.setStock(p.getStock());
                    db.setImageUrl(p.getImageUrl());
                    db.setCategory(p.getCategory());
                    return ResponseEntity.ok(productService.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Product>> byCategory(@PathVariable int categoryId) {
        return categoryService.findById(categoryId)
                .map(cat -> ResponseEntity.ok(productService.findByCategory(cat)))
                .orElse(ResponseEntity.notFound().build());
    }
}

