package com.plantverde.repository;

import com.plantverde.entity.User;
import com.plantverde.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserAndPlantId(User user, Long plantId);
    void deleteByUserAndPlantId(User user, Long plantId);
}
