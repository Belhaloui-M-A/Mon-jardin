package com.plantverde.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String emailContact = "contact@plantverde.dz";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String phoneContact = "05555555";

    @Column(nullable = false, length = 255)
    @Builder.Default
    private String addressFr = "Tiaret, Algérie";

    @Column(nullable = false, length = 255)
    @Builder.Default
    private String addressAr = "تيارت، الجزائر";

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String descriptionFr = "Votre boutique de plantes en ligne en Algérie. Des plantes soigneusement sélectionnées, livrées avec leurs conseils d'entretien.";

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String descriptionAr = "متجرك الإلكتروني لبيع النباتات في الجزائر. نباتات مختارة بعناية مع نصائح مخصصة للعناية بها.";
}
