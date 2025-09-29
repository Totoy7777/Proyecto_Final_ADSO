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
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class ProductController {

    @Autowired private ProductService productService;
    @Autowired private CategoryService categoryService;

    @GetMapping
    public List<Product> all() { return productService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Product> byId(@PathVariable int id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Product>> byCategory(@PathVariable int categoryId) {
        return categoryService.findById(categoryId)
                .map(cat -> ResponseEntity.ok(productService.findByCategory(cat)))
                .orElse(ResponseEntity.notFound().build());
    }
}
