package com.plantverde.repository;

import com.plantverde.entity.Review;
import com.plantverde.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query(value = "SELECT r FROM Review r JOIN FETCH r.user WHERE r.published = true ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM Review r WHERE r.published = true")
    Page<Review> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT r FROM Review r JOIN FETCH r.user ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM Review r")
    Page<Review> findAllWithUser(Pageable pageable);

    boolean existsByUserAndTargetType(User user, Review.ReviewTarget targetType);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.published = true")
    Double getAverageRating();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.published = true")
    Long countPublished();

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.published = true GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistribution();

    @Query("""
        SELECT r.targetType, AVG(r.rating)
        FROM Review r WHERE r.published = true
        GROUP BY r.targetType
        """)
    List<Object[]> getAverageByTarget();
}
