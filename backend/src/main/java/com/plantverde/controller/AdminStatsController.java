package com.plantverde.controller;

import com.plantverde.repository.OrderRepository;
import com.plantverde.repository.PlantRepository;
import com.plantverde.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin - Statistiques")
public class AdminStatsController {

    private final OrderRepository orderRepository;
    private final PlantRepository plantRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // KPIs
        stats.put("totalRevenue", orderRepository.getTotalRevenue());
        stats.put("revenueThisMonth", orderRepository.getRevenueFrom(LocalDateTime.now().minusDays(30)));
        stats.put("pendingOrders", orderRepository.countPendingOrders());
        stats.put("totalClients", userRepository.count() - 1); // Exclut admin
        stats.put("totalPlants", plantRepository.count());
        stats.put("lowStockCount", plantRepository.findLowStockPlants().size());

        // Top 5 plantes
        List<Object[]> topPlants = orderRepository.findTopSellingPlants(PageRequest.of(0, 5));
        stats.put("topSellingPlants", topPlants.stream()
            .map(row -> Map.of("name", row[0], "totalSold", row[1]))
            .toList());

        // Ventes 30 derniers jours
        List<Object[]> dailySales = orderRepository.getDailySales(LocalDateTime.now().minusDays(30));
        stats.put("dailySales", dailySales.stream()
            .map(row -> Map.of("date", row[0].toString(), "revenue", row[1]))
            .toList());

        // Stock faible
        stats.put("lowStockPlants", plantRepository.findLowStockPlants().stream()
            .map(p -> Map.of("id", p.getId(), "name", p.getName(), "stock", p.getStock()))
            .toList());

        return ResponseEntity.ok(stats);
    }
}
