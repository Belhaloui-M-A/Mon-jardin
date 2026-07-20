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
            .password(passwordEncoder.encode("password"))
            .role(User.Role.ADMIN).enabled(true).build());

        // User client1 = userRepository.save(User.builder()
        //     .firstName("Karim").lastName("Benali")
        //     .email("karim@test.dz")
        //     .password(passwordEncoder.encode("password"))
        //     .phone("0555123456").address("12 Rue des Oliviers, Alger")
        //     .role(User.Role.CLIENT).enabled(true).build());

        // User client2 = userRepository.save(User.builder()
        //     .firstName("Amira").lastName("Cherif")
        //     .email("amira@test.dz")
        //     .password(passwordEncoder.encode("password"))
        //     .phone("0661987654").address("5 Cité Jardin, Oran")
        //     .role(User.Role.CLIENT).enabled(true).build());

        // // ===== CATÉGORIES =====
        // Category interieur = categoryRepository.save(Category.builder()
        //     .name("Intérieur").description("Plantes d'appartement, peu exigeantes en lumière").build());
        // Category exterieur = categoryRepository.save(Category.builder()
        //     .name("Extérieur").description("Plantes de jardin et balcon").build());
        // Category succulentes = categoryRepository.save(Category.builder()
        //     .name("Succulentes & Cactus").description("Idéales pour débutants, arrosage minimal").build());
        // Category aromatiques = categoryRepository.save(Category.builder()
        //     .name("Aromatiques").description("Plantes comestibles et médicinales").build());
        // Category tropicales = categoryRepository.save(Category.builder()
        //     .name("Tropicales").description("Plantes exotiques à feuillage spectaculaire").build());

        // // ===== PLANTES =====
        // List<Plant> plants = List.of(
        //     Plant.builder().name("Monstera Deliciosa").species("Monstera deliciosa")
        //         .description("La plante tendance par excellence. Ses grandes feuilles découpées apportent une touche tropicale à tout intérieur.")
        //         .price(new BigDecimal("2500")).stock(15).category(interieur)
        //         .wateringFrequency("1 fois/semaine").lightRequirement("Lumière indirecte")
        //         .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("1.5 - 2m")
        //         .toxicForAnimals(true).build(),

          
        //     Plant.builder().name("Romarin").species("Salvia rosmarinus")
        //         .description("Aromate méditerranéen indispensable. Résistant à la sécheresse, parfumé toute l'année.")
        //         .price(new BigDecimal("350")).stock(40).category(aromatiques)
        //         .wateringFrequency("1 fois/semaine").lightRequirement("Plein soleil")
        //         .difficultyLevel(Plant.DifficultyLevel.FACILE).adultSize("40cm - 1.5m")
        //         .toxicForAnimals(false).build()
        // );

        // plantRepository.saveAll(plants);
        // log.info("✅ {} plantes, {} catégories et {} utilisateurs créés.", plants.size(), 5, 3);
    }
}
