package com.plantverde.dto.request;

import jakarta.validation.constraints.*;

public record CreateUserRequest(
    @NotBlank @Size(min = 2, max = 50) String firstName,
    @NotBlank @Size(min = 2, max = 50) String lastName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères") String password,
    String phone,
    String address,
    @NotBlank String role
) {}
