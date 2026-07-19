package com.plantverde.service;

import com.plantverde.dto.response.OrderResponse;
import com.plantverde.entity.*;
import com.plantverde.exception.BusinessException;
import com.plantverde.repository.CartItemRepository;
import com.plantverde.repository.OrderRepository;
import com.plantverde.repository.PlantRepository;
import com.plantverde.service.impl.OrderService;
import com.plantverde.service.impl.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Vérifie la logique métier des commandes : décrément/restitution de stock
 * et règles d'annulation.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock UserService userService;
    @Mock PlantRepository plantRepository;

    @InjectMocks OrderService orderService;

    private User user() {
        return User.builder().email("karim@test.dz").role(User.Role.CLIENT).build();
    }

    private Plant plant(int stock) {
        return Plant.builder().id(1L).name("Monstera").price(new BigDecimal("100"))
            .stock(stock).discountPercent(0).active(true).build();
    }

    @Test
    void placeOrder_decrementeLeStock_etViderLePanier() {
        User user = user();
        Plant plant = plant(10);
        CartItem item = CartItem.builder().user(user).plant(plant).quantity(2).build();

        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(cartItemRepository.findByUser(user)).thenReturn(List.of(item));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse order = orderService.placeOrder("karim@test.dz", "12 rue X", "Alger", "0555", null);

        assertThat(plant.getStock()).isEqualTo(8);              // 10 - 2
        assertThat(order.total()).isEqualByComparingTo("200");  // 100 x 2
        assertThat(order.items()).hasSize(1);
        verify(plantRepository).save(plant);
        verify(cartItemRepository).deleteByUser(user);
    }

    @Test
    void placeOrder_panierVide_echoue() {
        User user = user();
        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(cartItemRepository.findByUser(user)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.placeOrder("karim@test.dz", "a", "b", "c", null))
            .isInstanceOf(BusinessException.class);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void placeOrder_stockInsuffisant_echoue() {
        User user = user();
        Plant plant = plant(1);
        CartItem item = CartItem.builder().user(user).plant(plant).quantity(5).build();

        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(cartItemRepository.findByUser(user)).thenReturn(List.of(item));

        assertThatThrownBy(() -> orderService.placeOrder("karim@test.dz", "a", "b", "c", null))
            .isInstanceOf(BusinessException.class);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void cancel_remetLeStock_etPasseEnAnnulee() {
        User user = user();
        Plant plant = plant(8);
        OrderItem oi = OrderItem.builder().plant(plant).quantity(2).unitPrice(new BigDecimal("100")).build();
        Order order = Order.builder().id(1L).client(user).status(Order.OrderStatus.PENDING)
            .items(List.of(oi)).total(new BigDecimal("200")).build();

        when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.cancel(1L, "karim@test.dz");

        assertThat(plant.getStock()).isEqualTo(10);   // 8 + 2 restitués
        assertThat(result.status()).isEqualTo("CANCELLED");
    }

    @Test
    void cancel_commandeExpediee_echoue() {
        User user = user();
        Order order = Order.builder().id(1L).client(user).status(Order.OrderStatus.SHIPPED).build();
        when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));

        assertThatThrownBy(() -> orderService.cancel(1L, "karim@test.dz"))
            .isInstanceOf(BusinessException.class);
    }
}
