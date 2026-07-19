package com.plantverde.dto.response;

import com.plantverde.entity.User;

import java.time.LocalDateTime;

/**
 * Vue publique d'un utilisateur exposée par l'API.
 * N'expose JAMAIS le hash du mot de passe ni les relations JPA.
 */
public record UserResponse(
    Long id,
    String email,
    String firstName,
    String lastName,
    String phone,
    String address,
    String role,
    boolean enabled,
    LocalDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
            u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
            u.getPhone(), u.getAddress(), u.getRole().name(), u.isEnabled(), u.getCreatedAt()
        );
    }
}
