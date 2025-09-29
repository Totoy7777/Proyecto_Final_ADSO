package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Category;
import com.proyecto_final.tienda_adso.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

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
    public void delete(int id) { categoryRepository.deleteById(id); }
}
