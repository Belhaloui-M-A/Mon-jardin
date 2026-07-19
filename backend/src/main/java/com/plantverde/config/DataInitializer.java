package com.plantverde.config;

import com.plantverde.entity.Category;
import com.plantverde.entity.Plant;
import com.plantverde.entity.User;
import com.plantverde.repository.CategoryRepository;
import com.plantverde.repository.PlantRepository;
import com.plantverde.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PlantRepository plantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Données déjà initialisées, skip.");
            return;
        }

        log.info("Initialisation des données PlantVerde...");

        // ===== COMPTES =====
        User admin = userRepository.save(User.builder()
            .firstName("Admin").lastName("PlantVerde")
            .email("admin@plantverde.dz")
            .password(passwordEncoder.encode("admin123"))
            .role(User.Role.ADMIN).enabled(true).build());

        User client1 = userRepository.save(User.builder()
            .firstName("Karim").lastName("Benali")
            .email("karim@test.dz")
            .password(passwordEncoder.encode("client123"))
            .phone("0555123456").address("12 Rue des Oliviers, Alger")
            .role(User.Role.CLIENT).enabled(true).build());

        User client2 = userRepository.save(User.builder()
            .firstName("Amira").lastName("Cherif")
            .email("amira@test.dz")
            .password(passwordEncoder.encode("client123"))
            .phone("0661987654").address("5 Cité Jardin, Oran")
            .role(User.Role.CLIENT).enabled(true).build());

        // ===== CATÉGORIES =====
        Category interieur = categoryRepository.save(Category.builder()
            .name("Intérieur").description("Plantes d'appartement, peu exigeantes en lumière").build());
        Category exterieur = categoryRepository.save(Category.builder()
            .name("Extérieur").description("Plantes de jardin et balcon").build());
        Category succulentes = categoryRepository.save(Category.builder()
            .name("Succulentes & Cactus").description("Idéales pour débutants, arrosage minimal").build());
        Category aromatiques = categoryRepository.save(Category.builder()
            .name("Aromatiques").description("Plantes comestibles et médicinales").build());
        Category tropicales = categoryRepository.save(Category.builder()
            .name("Tropicales").description("Plantes exotiques à feuillage spectaculaire").build());

        // ===== PLANTES =====
        List<Plant> plants = List.of(
            Plant.builder().name("Monstera Deliciosa").species("Monstera deliciosa")
                .description("La plante tendance par excellence. Ses grandes feuilles découpées apportent une touche tropicale à tout intérieur.")
                .price(new BigDecimal("2500")).stock(15).category(interieur)
                .wateringFrequency("1 fois/semaine").lightRequirement("Lumière indirecte")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("1.5 - 2m")
                .toxicForAnimals(true).build(),

            Plant.builder().name("Pothos Doré").species("Epipremnum aureum")
                .description("Plante grimpante très résistante, parfaite pour les débutants. Purifie l'air naturellement.")
                .price(new BigDecimal("800")).stock(30).category(interieur)
                .wateringFrequency("1 fois/10 jours").lightRequirement("Faible à moyenne")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("50cm - 2m (grimpant)")
                .toxicForAnimals(true).build(),

            Plant.builder().name("Ficus Lyrata").species("Ficus lyrata")
                .description("Le figuier feuille de violon, star des intérieurs contemporains. Feuilles larges et élégantes.")
                .price(new BigDecimal("4500")).stock(8).category(interieur)
                .wateringFrequency("1 fois/semaine").lightRequirement("Lumière vive indirecte")
                .difficultyLevel(Plant.DifficultyLevel.MOYEN).adultSize("1.5 - 3m")
                .toxicForAnimals(true).build(),

            Plant.builder().name("Aloé Vera").species("Aloe barbadensis miller")
                .description("Plante médicinale aux multiples vertus. Son gel soulage les brûlures et hydrate la peau.")
                .price(new BigDecimal("600")).stock(40).category(succulentes)
                .wateringFrequency("1 fois/3 semaines").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("30 - 60cm")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Cactus Saguaro").species("Carnegiea gigantea")
                .description("Le cactus emblématique du désert américain. Très longue durée de vie, nécessite peu de soins.")
                .price(new BigDecimal("1200")).stock(20).category(succulentes)
                .wateringFrequency("1 fois/mois").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("20cm - 1m (croissance lente)")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Basilic").species("Ocimum basilicum")
                .description("Indispensable en cuisine méditerranéenne. Arôme puissant, facile à cultiver en pot.")
                .price(new BigDecimal("300")).stock(50).category(aromatiques)
                .wateringFrequency("2-3 fois/semaine").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("20 - 40cm")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Menthe Verte").species("Mentha spicata")
                .description("La menthe fraîche pour vos thés et plats. Se propage facilement, garder en pot.")
                .price(new BigDecimal("250")).stock(45).category(aromatiques)
                .wateringFrequency("3 fois/semaine").lightRequirement("Soleil partiel")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("30 - 60cm")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Rosier Hybride").species("Rosa hybrida")
                .description("Classique indémodable du jardin algérien. Floraison abondante de mai à octobre.")
                .price(new BigDecimal("1800")).stock(12).category(exterieur)
                .wateringFrequency("2 fois/semaine").lightRequirement("Plein soleil (6h min)")
                .difficultyLevel(Plant.DifficultyLevel.MOYEN).adultSize("60cm - 1.5m")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Géranium").species("Pelargonium zonale")
                .description("Parfait pour balcons et terrasses. Fleurs colorées tout l'été, très résistant à la chaleur.")
                .price(new BigDecimal("450")).stock(35).category(exterieur)
                .wateringFrequency("2 fois/semaine").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("30 - 50cm")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Bird of Paradise").species("Strelitzia reginae")
                .description("La plante du paradis aux fleurs spectaculaires orange et bleu. Symbole d'élégance tropicale.")
                .price(new BigDecimal("6500")).stock(5).category(tropicales)
                .wateringFrequency("1 fois/semaine").lightRequirement("Lumière vive")
                .difficultyLevel(Plant.DifficultyLevel.MOYEN).adultSize("1 - 2m")
                .toxicForAnimals(true).build(),

            Plant.builder().name("Palmier Areca").species("Dypsis lutescens")
                .description("Palmier d'intérieur très élégant qui humidifie naturellement l'air. Idéal pour grands espaces.")
                .price(new BigDecimal("5500")).stock(7).category(tropicales)
                .wateringFrequency("2 fois/semaine").lightRequirement("Lumière vive indirecte")
                .difficultyLevel(Plant.DifficultyLevel.MOYEN).adultSize("1.5 - 2.5m")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Lavande").species("Lavandula angustifolia")
                .description("Son parfum envoûtant repousse les insectes et calme le stress. Idéale en bordure de jardin.")
                .price(new BigDecimal("500")).stock(25).category(exterieur)
                .wateringFrequency("1 fois/semaine").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("40 - 80cm")
                .toxicForAnimals(false).discountPercent(10).build(),

            Plant.builder().name("Echeveria").species("Echeveria elegans")
                .description("Succulente en rosette aux couleurs pastel. Parfaite pour compositions et terrarium.")
                .price(new BigDecimal("400")).stock(60).category(succulentes)
                .wateringFrequency("1 fois/2 semaines").lightRequirement("Lumière vive")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("10 - 15cm")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Calathea Orbifolia").species("Goeppertia orbifolia")
                .description("Feuillage rayé spectaculaire. Ses feuilles se ferment la nuit, la plante qui \"dort\".")
                .price(new BigDecimal("3200")).stock(10).category(tropicales)
                .wateringFrequency("2 fois/semaine").lightRequirement("Ombre à lumière indirecte")
                .difficultyLevel(Plant.DifficultyLevel.DIFFICILE).adultSize("60cm - 1m")
                .toxicForAnimals(false).build(),

            Plant.builder().name("Romarin").species("Salvia rosmarinus")
                .description("Aromate méditerranéen indispensable. Résistant à la sécheresse, parfumé toute l'année.")
                .price(new BigDecimal("350")).stock(40).category(aromatiques)
                .wateringFrequency("1 fois/semaine").lightRequirement("Plein soleil")
                .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("40cm - 1.5m")
                .toxicForAnimals(false).build()
        );

        plantRepository.saveAll(plants);
        log.info("✅ {} plantes, {} catégories et {} utilisateurs créés.", plants.size(), 5, 3);
    }
}
