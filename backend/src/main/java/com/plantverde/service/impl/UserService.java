package com.plantverde.service.impl;

import com.plantverde.dto.request.UpdateProfileRequest;
import com.plantverde.dto.response.UserResponse;
import com.plantverde.entity.User;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * Récupère l'entité User par email (réutilisé par les autres services métier).
     */
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse getProfile(String email) {
        return UserResponse.from(getByEmail(email));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = getByEmail(email);
        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null)  user.setLastName(req.lastName());
        if (req.phone() != null)     user.setPhone(req.phone());
        if (req.address() != null)   user.setAddress(req.address());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        user.setEnabled(!user.isEnabled());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse createUser(com.plantverde.dto.request.CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new com.plantverde.exception.BusinessException("Un compte existe déjà avec cet email");
        }
        User.Role roleEnum;
        try {
            roleEnum = User.Role.valueOf(req.role());
        } catch (IllegalArgumentException e) {
            throw new com.plantverde.exception.BusinessException("Rôle invalide");
        }

        User user = User.builder()
            .firstName(req.firstName())
            .lastName(req.lastName())
            .email(req.email())
            .password(passwordEncoder.encode(req.password()))
            .phone(req.phone())
            .address(req.address())
            .role(roleEnum)
            .enabled(true)
            .build();

        return UserResponse.from(userRepository.save(user));
    }
}
