package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.service.CategoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    @Autowired private CategoryService categoryService;

    @GetMapping
    public List<Category> all() { return categoryService.findAll(); }

    @PostMapping
    public Category create(@RequestBody Category c) { return categoryService.save(c); }

    @GetMapping("/{id}")
    public ResponseEntity<Category> byId(@PathVariable int id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable int id, @RequestBody Category c) {
        return categoryService.findById(id)
                .map(db -> {
                    db.setName(c.getName());
                    db.setParent(c.getParent());
                    return ResponseEntity.ok(categoryService.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

