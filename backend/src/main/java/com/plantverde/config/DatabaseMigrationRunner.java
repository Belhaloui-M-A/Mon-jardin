package com.plantverde.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Vérification et migration des données de la base de données...");
        try {
            // Vérifier si la colonne image_url existe encore dans la table plants
            Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM information_schema.columns WHERE table_name='plants' AND column_name='image_url'",
                Integer.class
            );

            if (count != null && count > 0) {
                log.info("Colonne image_url trouvée dans la table plants. Début de la migration...");
                
                // Insérer les anciennes urls dans la nouvelle table plant_images (si elle existe, elle a été créée par Hibernate update)
                // On vérifie d'abord si la table plant_images existe
                Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.tables WHERE table_name='plant_images'",
                    Integer.class
                );

                if (tableCount != null && tableCount > 0) {
                    jdbcTemplate.execute(
                        "INSERT INTO plant_images (plant_id, image_url) " +
                        "SELECT id, image_url FROM plants WHERE image_url IS NOT NULL AND image_url != ''"
                    );
                    log.info("Données migrées vers plant_images avec succès.");

                    // Optionnel : on pourrait dropper la colonne, mais on va simplement la laisser ignorée par Hibernate ou la vider.
                    // jdbcTemplate.execute("ALTER TABLE plants DROP COLUMN image_url");
                    // log.info("Colonne image_url supprimée de la table plants.");
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de la migration des données: {}", e.getMessage());
        }
    }
}
