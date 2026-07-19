package com.plantverde.controller;

import com.plantverde.entity.Review;
import com.plantverde.entity.User;
import com.plantverde.exception.BusinessException;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.ReviewRepository;
import com.plantverde.service.impl.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Évaluations")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    // ===== PUBLIC : lire les avis =====

    @GetMapping
    public ResponseEntity<Page<Review>> getPublished(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
            reviewRepository.findByPublishedTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        Double avg = reviewRepository.getAverageRating();
        stats.put("average",   avg != null ? avg : 0.0);
        stats.put("total",     reviewRepository.countPublished());
        stats.put("distribution", reviewRepository.getRatingDistribution().stream()
            .map(r -> Map.of("rating", r[0], "count", r[1])).toList());
        stats.put("byTarget",  reviewRepository.getAverageByTarget().stream()
            .map(r -> Map.of("target", r[0], "avg", r[1])).toList());
        return ResponseEntity.ok(stats);
    }

    // ===== CLIENT : soumettre un avis =====

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Review> submit(
        @AuthenticationPrincipal UserDetails ud,
        @RequestBody ReviewRequest req
    ) {
        User user = userService.getByEmail(ud.getUsername());

        if (req.rating() < 1 || req.rating() > 5) {
            throw new BusinessException("La note doit être entre 1 et 5.");
        }

        Review review = reviewRepository.save(Review.builder()
            .user(user)
            .targetType(req.targetType())
            .rating(req.rating())
            .comment(req.comment())
            .published(true)
            .build());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(review.getId()).toUri();
        return ResponseEntity.created(location).body(review);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Review> update(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails ud,
        @RequestBody ReviewRequest req
    ) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avis", id));

        if (!review.getUser().getEmail().equals(ud.getUsername())) {
            throw new BusinessException("Vous ne pouvez modifier que vos propres avis.");
        }

        review.setRating(req.rating());
        review.setComment(req.comment());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ResponseEntity<Void> delete(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails ud
    ) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avis", id));

        boolean isAdmin = ud.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !review.getUser().getEmail().equals(ud.getUsername())) {
            throw new BusinessException("Action non autorisée.");
        }

        reviewRepository.delete(review);
        return ResponseEntity.noContent().build();
    }

    // ===== ADMIN : modération =====

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Review>> getAll(
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(reviewRepository.findAllWithUser(PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Review> togglePublished(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avis", id));
        review.setPublished(!review.isPublished());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    public record ReviewRequest(
        Review.ReviewTarget targetType,
        Integer rating,
        String comment
    ) {}
}
