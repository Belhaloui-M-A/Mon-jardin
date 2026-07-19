package com.plantverde.controller;

import com.plantverde.dto.response.OrderResponse;
import com.plantverde.entity.Order;
import com.plantverde.service.impl.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Commandes")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<OrderResponse> placeOrder(
        @AuthenticationPrincipal UserDetails user,
        @Valid @RequestBody PlaceOrderRequest req
    ) {
        OrderResponse created = orderService.placeOrder(
            user.getUsername(), req.deliveryAddress(), req.deliveryCity(), req.deliveryPhone(), req.notes()
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderResponse>> myOrders(
        @AuthenticationPrincipal UserDetails user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getUsername(), page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrder(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails user
    ) {
        boolean isAdmin = user.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getById(id, user.getUsername(), isAdmin));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> allOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateStatusRequest req
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, req.status()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<OrderResponse> cancel(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(orderService.cancel(id, user.getUsername()));
    }

    public record PlaceOrderRequest(
        @NotBlank String deliveryAddress,
        @NotBlank String deliveryCity,
        @NotBlank String deliveryPhone,
        String notes
    ) {}

    public record UpdateStatusRequest(@NotNull Order.OrderStatus status) {}
}
