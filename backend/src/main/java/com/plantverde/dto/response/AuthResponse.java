package com.plantverde.dto.response;

public record AuthResponse(
    String email,
    String firstName,
    String lastName,
    String role,
    String message
) {}
