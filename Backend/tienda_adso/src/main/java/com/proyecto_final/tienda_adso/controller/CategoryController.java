package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.CategoryDTO;
import com.proyecto_final.tienda_adso.dto.CategoryRequest;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class CategoryController {

    @Autowired private CategoryService categoryService;

    @GetMapping
    public List<CategoryDTO> all() {
        return categoryService.findAll().stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }


    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CategoryRequest request) {
        String name = request.getName().trim();
        Integer parentId = request.getParentId();

        Category parent = null;
        if (parentId != null) {
            parent = categoryService.findById(parentId).orElse(null);
            if (parent == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SimpleResponse(false, "La categoría principal seleccionada no existe."));
            }
        }

        for (Category existing : categoryService.findAllByName(name)) {
            Category existingParent = existing.getParent();
            Integer existingParentId = existingParent != null ? existingParent.getCategoryId() : null;
            if (Objects.equals(existingParentId, parentId)) {
                return ResponseEntity.ok(CategoryDTO.fromEntity(existing));
            }
        }

        Category category = new Category();
        category.setName(name);
        category.setParent(parent);
        Category saved = categoryService.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(CategoryDTO.fromEntity(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> byId(@PathVariable int id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> update(@PathVariable int id, @RequestBody Category c) {
        return categoryService.findById(id)
                .map(db -> {
                    db.setName(c.getName());
                    db.setParent(c.getParent());
                    Category saved = categoryService.save(db);
                    return ResponseEntity.ok(CategoryDTO.fromEntity(saved));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
