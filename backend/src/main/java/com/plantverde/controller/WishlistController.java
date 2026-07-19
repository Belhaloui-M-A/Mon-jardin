package com.plantverde.controller;

import com.plantverde.entity.Plant;
import com.plantverde.entity.User;
import com.plantverde.entity.WishlistItem;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.PlantRepository;
import com.plantverde.repository.WishlistItemRepository;
import com.plantverde.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistItemRepository wishlistRepo;
    private final UserService userService;
    private final PlantRepository plantRepo;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud.getUsername());
        return ResponseEntity.ok(wishlistRepo.findByUser(user));
    }

    @PostMapping("/{plantId}")
    public ResponseEntity<WishlistItem> add(@AuthenticationPrincipal UserDetails ud, @PathVariable Long plantId) {
        User user = getUser(ud.getUsername());
        Plant plant = plantRepo.findById(plantId).orElseThrow(() -> new ResourceNotFoundException("Plante", plantId));
        return wishlistRepo.findByUserAndPlantId(user, plantId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.ok(wishlistRepo.save(
                WishlistItem.builder().user(user).plant(plant).build())));
    }

    @DeleteMapping("/{plantId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserDetails ud, @PathVariable Long plantId) {
        User user = getUser(ud.getUsername());
        wishlistRepo.deleteByUserAndPlantId(user, plantId);
        return ResponseEntity.noContent().build();
    }

    private User getUser(String email) {
        return userService.getByEmail(email);
    }
}
