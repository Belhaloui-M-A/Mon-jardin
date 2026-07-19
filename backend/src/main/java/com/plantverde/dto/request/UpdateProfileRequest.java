package com.plantverde.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Mise à jour partielle du profil : seuls les champs non nuls sont appliqués.
 */
public record UpdateProfileRequest(
    @Size(min = 2, max = 50) String firstName,
    @Size(min = 2, max = 50) String lastName,
    @Size(max = 20) String phone,
    @Size(max = 255) String address
) {}
