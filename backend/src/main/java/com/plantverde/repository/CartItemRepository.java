package com.plantverde.repository;

import com.plantverde.entity.CartItem;
import com.plantverde.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndPlantId(User user, Long plantId);
    void deleteByUser(User user);
}
