package com.plantverde.repository;

import com.plantverde.entity.Order;
import com.plantverde.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByClientOrderByCreatedAtDesc(User client, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.createdAt >= :from AND o.status != 'CANCELLED'")
    BigDecimal getRevenueFrom(@Param("from") LocalDateTime from);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING' OR o.status = 'CONFIRMED'")
    Long countPendingOrders();

    @Query("""
        SELECT oi.plant.name, SUM(oi.quantity) as total
        FROM OrderItem oi
        WHERE oi.order.status != 'CANCELLED'
        GROUP BY oi.plant.id, oi.plant.name
        ORDER BY total DESC
        """)
    List<Object[]> findTopSellingPlants(Pageable pageable);

    @Query("""
        SELECT DATE(o.createdAt), SUM(o.total)
        FROM Order o
        WHERE o.createdAt >= :from AND o.status != 'CANCELLED'
        GROUP BY DATE(o.createdAt)
        ORDER BY DATE(o.createdAt)
        """)
    List<Object[]> getDailySales(@Param("from") LocalDateTime from);
}
