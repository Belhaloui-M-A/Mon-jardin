package com.plantverde.controller;

import com.plantverde.dto.request.CategoryRequest;
import com.plantverde.entity.Category;
import com.plantverde.exception.BusinessException;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.CategoryRepository;
import com.plantverde.repository.PlantRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import com.plantverde.service.FileStorageService;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final PlantRepository plantRepository;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> create(
            @Valid @ModelAttribute CategoryRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image);
        }

        Category cat = categoryRepository.save(Category.builder()
            .name(req.name())
            .description(req.description())
            .imageUrl(imageUrl)
            .build());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(cat.getId()).toUri();
        return ResponseEntity.created(location).body(cat);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> update(
            @PathVariable Long id, 
            @Valid @ModelAttribute CategoryRequest req,
            @RequestParam(required = false) String existingImage,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
            
        String imageUrl = existingImage;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image);
        }
            
        cat.setName(req.name());
        cat.setDescription(req.description());
        cat.setImageUrl(imageUrl);
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
