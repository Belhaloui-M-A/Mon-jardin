package com.plantverde.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "plants")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Plant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String species;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "image_url")
    private String imageUrl;

    // Conseils d'entretien
    @Column(name = "watering_frequency", length = 50)
    private String wateringFrequency; // ex: "2 fois/semaine"

    @Column(name = "light_requirement", length = 50)
    private String lightRequirement; // ex: "Lumière indirecte"

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.FACILE;

    @Column(name = "adult_size", length = 50)
    private String adultSize; // ex: "30-50 cm"

    @Column(name = "toxic_for_animals")
    @Builder.Default
    private boolean toxicForAnimals = false;

    @Column(name = "discount_percent")
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Prix effectivement payé : prix de base diminué de {@code discountPercent}.
     * Sert de référence pour le panier et le snapshot de la commande.
     */
    public BigDecimal getFinalPrice() {
        if (discountPercent != null && discountPercent > 0) {
            BigDecimal discount = price.multiply(BigDecimal.valueOf(discountPercent)).divide(BigDecimal.valueOf(100));
            return price.subtract(discount);
        }
        return price;
    }

    public enum DifficultyLevel {
        FACILE, MOYEN, DIFFICILE
    }
}
