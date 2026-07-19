package com.plantverde.service.impl;

import com.plantverde.dto.request.PlantRequest;
import com.plantverde.entity.Category;
import com.plantverde.entity.Plant;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.CategoryRepository;
import com.plantverde.repository.PlantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlantService {

    private final PlantRepository plantRepository;
    private final CategoryRepository categoryRepository;

    public Page<Plant> searchPlants(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                     String search, Boolean inStock, int page, int size, String sortBy) {
        Sort sort = switch (sortBy != null ? sortBy : "createdAt") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name"       -> Sort.by("name").ascending();
            default           -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page, size, sort);

        // Si l'utilisateur n'est pas ADMIN, on affiche uniquement les plantes en stock
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            inStock = true;
        }

        return plantRepository.searchPlants(categoryId, minPrice, maxPrice, search, inStock, pageable);
    }

    public Plant getById(Long id) {
        return plantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Plante", id));
    }

    public List<Plant> getSimilar(Long plantId, Long categoryId) {
        List<Plant> similar = plantRepository.findTop5ByCategoryIdAndActiveTrueAndIdNot(categoryId, plantId);
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            similar = similar.stream().filter(p -> p.getStock() > 0).toList();
        }
        return similar;
    }

    @Transactional
    public Plant create(PlantRequest req, Long categoryId) {
        Plant plant = new Plant();
        apply(plant, req);
        plant.setCategory(findCategory(categoryId));
        return plantRepository.save(plant);
    }

    @Transactional
    public Plant update(Long id, PlantRequest req, Long categoryId) {
        Plant plant = getById(id);
        apply(plant, req);
        if (categoryId != null) {
            plant.setCategory(findCategory(categoryId));
        }
        return plantRepository.save(plant);
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie", categoryId));
    }

    /** Recopie les champs autorisés de la requête vers l'entité (les nuls conservent la valeur courante/défaut). */
    private void apply(Plant plant, PlantRequest req) {
        plant.setName(req.name());
        plant.setSpecies(req.species());
        plant.setDescription(req.description());
        plant.setPrice(req.price());
        plant.setStock(req.stock());
        plant.setImageUrl(req.imageUrl());
        plant.setWateringFrequency(req.wateringFrequency());
        plant.setLightRequirement(req.lightRequirement());
        plant.setAdultSize(req.adultSize());
        if (req.difficultyLevel() != null) plant.setDifficultyLevel(req.difficultyLevel());
        if (req.toxicForAnimals() != null) plant.setToxicForAnimals(req.toxicForAnimals());
        if (req.discountPercent() != null) plant.setDiscountPercent(req.discountPercent());
        if (req.active() != null)          plant.setActive(req.active());
    }

    /**
     * Suppression logique (active=false) : la plante reste référencée par les
     * commandes passées (OrderItem) et disparaît seulement du catalogue public.
     */
    @Transactional
    public void delete(Long id) {
        Plant plant = getById(id);
        plant.setActive(false);
        plantRepository.save(plant);
    }
}
