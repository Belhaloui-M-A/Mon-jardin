package com.plantverde.controller;

import com.plantverde.entity.CartItem;
import com.plantverde.service.impl.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCart(user.getUsername()));
    }

    @PostMapping("/{plantId}")
    public ResponseEntity<CartItem> add(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable Long plantId,
        @RequestBody QuantityRequest req
    ) {
        int quantity = req.quantity() != null ? req.quantity() : 1;
        return ResponseEntity.ok(cartService.addToCart(user.getUsername(), plantId, quantity));
    }

    @PutMapping("/{plantId}")
    public ResponseEntity<?> update(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable Long plantId,
        @RequestBody QuantityRequest req
    ) {
        CartItem updated = cartService.updateQuantity(user.getUsername(), plantId, req.quantity());
        return updated == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{plantId}")
    public ResponseEntity<Void> remove(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable Long plantId
    ) {
        cartService.removeFromCart(user.getUsername(), plantId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.noContent().build();
    }

    /** Quantité d'un article ; null sur l'ajout = 1 par défaut. */
    public record QuantityRequest(Integer quantity) {}
}
