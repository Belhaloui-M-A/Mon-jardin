package com.plantverde.repository;

import com.plantverde.entity.Plant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {

    @Query("""
        SELECT p FROM Plant p
        WHERE p.active = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(p.species) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR :inStock = false)
        """)
    Page<Plant> searchPlants(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        @Param("inStock") Boolean inStock,
        Pageable pageable
    );

    List<Plant> findTop5ByCategoryIdAndActiveTrueAndIdNot(Long categoryId, Long id);

    @Query("SELECT p FROM Plant p WHERE p.stock < 5 AND p.active = true ORDER BY p.stock ASC")
    List<Plant> findLowStockPlants();

    long countByCategoryId(Long categoryId);
}
