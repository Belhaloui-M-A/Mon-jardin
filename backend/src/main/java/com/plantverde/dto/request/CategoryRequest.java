package com.plantverde.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Données d'entrée pour créer/modifier une catégorie.
 */
public record CategoryRequest(
    @NotBlank @Size(max = 50) String name,
    @Size(max = 255) String description,
    String imageUrl
) {}
