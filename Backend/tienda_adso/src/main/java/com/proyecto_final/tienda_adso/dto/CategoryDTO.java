package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Category;

/**
 * Lightweight DTO that exposes category identifiers using the naming expected by the frontend.
 */
public class CategoryDTO {

    private final Integer categoryId;
    private final String name;
    private final Integer parentId;

    public CategoryDTO(Integer categoryId, String name, Integer parentId) {
        this.categoryId = categoryId;
        this.name = name;
        this.parentId = parentId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public Integer getId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public Integer getParentId() {
        return parentId;
    }

    public Integer getParentCategoryId() {
        return parentId;
    }

    public static CategoryDTO fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        Integer parent = category.getParent() != null ? category.getParent().getCategoryId() : null;
        return new CategoryDTO(category.getCategoryId(), category.getName(), parent);
    }
}
