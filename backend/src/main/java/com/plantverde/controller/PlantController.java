package com.plantverde.controller;

import com.plantverde.dto.request.PlantRequest;
import com.plantverde.entity.Plant;
import com.plantverde.service.impl.PlantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/plants")
@RequiredArgsConstructor
@Tag(name = "Plantes")
public class PlantController {

    private final PlantService plantService;

    @GetMapping
    @Operation(summary = "Recherche et filtre des plantes (public)")
    public ResponseEntity<Page<Plant>> search(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean inStock,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(required = false) String sortBy
    ) {
        return ResponseEntity.ok(
            plantService.searchPlants(categoryId, minPrice, maxPrice, search, inStock, page, size, sortBy)
        );
    }

    @GetMapping("/featured")
    @Operation(summary = "Récupère la plante du mois")
    public ResponseEntity<Plant> getFeatured() {
        Plant plant = plantService.getFeatured();
        if (plant == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(plant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(plantService.getById(id));
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Plant>> getSimilar(@PathVariable Long id) {
        Plant plant = plantService.getById(id);
        return ResponseEntity.ok(plantService.getSimilar(id, plant.getCategory().getId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Plant> create(
        @Valid @ModelAttribute PlantRequest plant,
        @RequestParam Long categoryId,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Plant created = plantService.createMultipart(plant, categoryId, images);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Plant> update(
        @PathVariable Long id,
        @Valid @ModelAttribute PlantRequest plant,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) List<String> existingImages,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.ok(plantService.updateMultipart(id, plant, categoryId, existingImages, images));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        plantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
