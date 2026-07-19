package com.plantverde.controller;

import com.plantverde.dto.request.CategoryRequest;
import com.plantverde.entity.Category;
import com.plantverde.exception.BusinessException;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.CategoryRepository;
import com.plantverde.repository.PlantRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final PlantRepository plantRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> create(@Valid @RequestBody CategoryRequest req) {
        Category cat = categoryRepository.save(Category.builder()
            .name(req.name())
            .description(req.description())
            .imageUrl(req.imageUrl())
            .build());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(cat.getId()).toUri();
        return ResponseEntity.created(location).body(cat);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
        cat.setName(req.name());
        cat.setDescription(req.description());
        cat.setImageUrl(req.imageUrl());
        return ResponseEntity.ok(categoryRepository.save(cat));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie", id);
        }
        // Empêche la violation de contrainte FK : on ne supprime pas une catégorie utilisée
        if (plantRepository.countByCategoryId(id) > 0) {
            throw new BusinessException("Impossible de supprimer une catégorie contenant des plantes");
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
