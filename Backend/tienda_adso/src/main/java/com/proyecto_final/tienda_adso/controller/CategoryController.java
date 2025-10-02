package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.CategoryDTO;
import com.proyecto_final.tienda_adso.dto.CategoryRequest;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        List<Category> duplicates = categoryService.findAllByName(name);
        for (Category existing : duplicates) {
            Category existingParent = existing.getParent();
            Integer existingParentId = existingParent != null ? existingParent.getCategoryId() : null;
            if (Objects.equals(existingParentId, parentId)) {
                return ResponseEntity.ok(CategoryDTO.fromEntity(existing));
            }
        }

        if (!duplicates.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SimpleResponse(false, "Ya existe otra categoría o subcategoría con ese nombre. Usa un nombre diferente."));
        }

        Category category = new Category();
        category.setName(name);
        category.setParent(parent);
        try {
            Category saved = categoryService.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(CategoryDTO.fromEntity(saved));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SimpleResponse(false, "No se puede guardar porque el nombre ya está en uso. Evita duplicar categorías o subcategorías."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> byId(@PathVariable int id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Category c) {
        return categoryService.findById(id)
                .map(db -> {
                    String name = c.getName() != null ? c.getName().trim() : null;
                    if (name == null || name.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new SimpleResponse(false, "El nombre de la categoría es obligatorio."));
                    }

                    Category parent = null;
                    Integer parentId = null;
                    if (c.getParent() != null && c.getParent().getCategoryId() != 0) {
                        parentId = c.getParent().getCategoryId();
                        parent = categoryService.findById(parentId).orElse(null);
                        if (parent == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new SimpleResponse(false, "La categoría principal seleccionada no existe."));
                        }
                    }

                    List<Category> duplicates = categoryService.findAllByName(name);
                    for (Category existing : duplicates) {
                        if (existing.getCategoryId() != db.getCategoryId()) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body(new SimpleResponse(false, "Ya existe otra categoría o subcategoría con ese nombre. Usa un nombre diferente."));
                        }
                    }

                    db.setName(name);
                    db.setParent(parent);

                    try {
                        Category saved = categoryService.save(db);
                        return ResponseEntity.ok(CategoryDTO.fromEntity(saved));
                    } catch (DataIntegrityViolationException ex) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new SimpleResponse(false, "No se puede actualizar porque el nombre ya está en uso. Evita duplicar categorías o subcategorías."));
                    }
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            boolean removed = categoryService.delete(id);
            if (!removed) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SimpleResponse(false, ex.getMessage()));
        }
    }
}
