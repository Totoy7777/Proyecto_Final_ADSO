package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.repository.CategoryRepository;
import com.proyecto_final.tienda_adso.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;

    public Category save(Category c) { return categoryRepository.save(c); }
    public List<Category> findAll() { return categoryRepository.findAll(); }
    public Optional<Category> findById(int id) { return categoryRepository.findById(id); }
    public Optional<Category> findByName(String name) {
        if (name == null) {
            return Optional.empty();
        }
        return categoryRepository.findAllByNameIgnoreCase(name).stream().findFirst();
    }

    public List<Category> findAllByName(String name) {
        if (name == null) {
            return List.of();
        }
        return categoryRepository.findAllByNameIgnoreCase(name);
    }

    @Transactional
    public boolean delete(int id) {
        Optional<Category> optional = categoryRepository.findById(id);
        if (optional.isEmpty()) {
            return false;
        }

        Category root = optional.get();
        List<Category> categoriesToRemove = new ArrayList<>();
        collectDescendants(root, categoriesToRemove);
        categoriesToRemove.add(root);

        List<String> categoriesWithProducts = new ArrayList<>();
        for (Category category : categoriesToRemove) {
            if (productRepository.existsByCategory(category)) {
                categoriesWithProducts.add(category.getName());
            }
        }

        if (!categoriesWithProducts.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar la categoría porque hay productos asociados a: "
                    + String.join(", ", categoriesWithProducts));
        }

        for (Category category : categoriesToRemove) {
            categoryRepository.delete(category);
        }
        return true;
    }

    private void collectDescendants(Category parent, List<Category> accumulator) {
        List<Category> children = categoryRepository.findAllByParent(parent);
        for (Category child : children) {
            collectDescendants(child, accumulator);
            accumulator.add(child);
        }
    }
}
