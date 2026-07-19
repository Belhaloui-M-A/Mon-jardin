package com.plantverde.dto.request;

import com.plantverde.entity.Plant;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Données d'entrée pour créer/modifier une plante.
 * N'expose pas id / dates / relations : empêche le mass-assignment
 * (le client ne peut pas forcer l'id d'une entité existante ni les champs d'audit).
 */
public record PlantRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 100) String species,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull @Min(0) Integer stock,
    String imageUrl,
    @Size(max = 50) String wateringFrequency,
    @Size(max = 50) String lightRequirement,
    Plant.DifficultyLevel difficultyLevel,
    @Size(max = 50) String adultSize,
    Boolean toxicForAnimals,
    @Min(0) @Max(100) Integer discountPercent,
    Boolean active
) {}
