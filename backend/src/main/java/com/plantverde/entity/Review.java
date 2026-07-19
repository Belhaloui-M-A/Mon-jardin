package com.plantverde.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Avis client portant sur un aspect du service (et non sur une plante précise).
 * La contrainte d'unicité (user, target_type) limite chaque client à un seul
 * avis par type. Le champ {@code published} permet la modération (masquage admin).
 */
@Entity
@Table(name = "reviews")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Type d'évaluation : SERVICE, DELIVERY, QUALITY, OVERALL */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewTarget targetType;

    /** Note de 1 à 5 */
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ReviewTarget {
        SERVICE, DELIVERY, QUALITY, OVERALL
    }
}
