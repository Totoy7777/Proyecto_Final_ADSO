package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.ProductRequest;
import com.proyecto_final.tienda_adso.dto.SimpleResponse;
import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.model.Product;
import com.proyecto_final.tienda_adso.service.CategoryService;
import com.proyecto_final.tienda_adso.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
@PreAuthorize("hasRole('ADMIN')")
public class ProductAdminController {

    private final ProductService productService;
    private final CategoryService categoryService;

    public ProductAdminController(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProductRequest request) {
        Optional<Category> categoryOptional = categoryService.findById(request.getCategoryId());
        if (categoryOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "La categoría seleccionada no existe."));
        }

        Category category = categoryOptional.get();
        ResponseEntity<SimpleResponse> hierarchyValidation = validateHierarchy(category, request.getParentCategoryId());
        if (hierarchyValidation != null) {
            return hierarchyValidation;
        }

        Product product = new Product();
        applyRequest(product, request, category);
        Product saved = productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @Valid @RequestBody ProductRequest request) {
        Optional<Product> productOptional = productService.findById(id);
        if (productOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Category> categoryOptional = categoryService.findById(request.getCategoryId());
        if (categoryOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "La categoría seleccionada no existe."));
        }

        Category category = categoryOptional.get();
        ResponseEntity<SimpleResponse> hierarchyValidation = validateHierarchy(category, request.getParentCategoryId());
        if (hierarchyValidation != null) {
            return hierarchyValidation;
        }

        Product existing = productOptional.get();
        applyRequest(existing, request, category);
        return ResponseEntity.ok(productService.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (productService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        try {
            productService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SimpleResponse(false, "No se puede eliminar el producto porque está asociado a otras operaciones."));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SimpleResponse(false, "Ocurrió un error inesperado al eliminar el producto."));
        }
    }

    private void applyRequest(Product product, ProductRequest request, Category category) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
    }

    private ResponseEntity<SimpleResponse> validateHierarchy(Category category, Integer parentCategoryId) {
        Category currentParent = category.getParent();

        if (parentCategoryId == null) {
            if (currentParent != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SimpleResponse(false, "Debes seleccionar una subcategoría válida."));
            }
            return null;
        }

        if (Objects.equals(category.getCategoryId(), parentCategoryId)) {
            return null;
        }

        if (currentParent != null && Objects.equals(currentParent.getCategoryId(), parentCategoryId)) {
            return null;
        }

        if (categoryService.findById(parentCategoryId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new SimpleResponse(false, "La categoría principal seleccionada no existe."));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new SimpleResponse(false, "La subcategoría no pertenece a la categoría principal indicada."));
    }
}
