package com.plantverde.service;

import com.plantverde.entity.CartItem;
import com.plantverde.entity.Plant;
import com.plantverde.entity.User;
import com.plantverde.exception.BusinessException;
import com.plantverde.repository.CartItemRepository;
import com.plantverde.repository.PlantRepository;
import com.plantverde.service.impl.CartService;
import com.plantverde.service.impl.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Vérifie la fusion de quantité (contrainte d'unicité user/plant) et la
 * suppression d'un article lorsque la quantité demandée tombe à zéro.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartItemRepository cartItemRepository;
    @Mock UserService userService;
    @Mock PlantRepository plantRepository;

    @InjectMocks CartService cartService;

    private final User user = User.builder().email("karim@test.dz").build();

    private Plant plant(int stock) {
        return Plant.builder().id(1L).name("Ficus").price(new BigDecimal("50"))
            .stock(stock).active(true).build();
    }

    @Test
    void addToCart_articleExistant_cumuleLaQuantite() {
        Plant plant = plant(10);
        CartItem existing = CartItem.builder().user(user).plant(plant).quantity(2).build();

        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(plantRepository.findById(1L)).thenReturn(Optional.of(plant));
        when(cartItemRepository.findByUserAndPlantId(user, 1L)).thenReturn(Optional.of(existing));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItem result = cartService.addToCart("karim@test.dz", 1L, 3);

        assertThat(result.getQuantity()).isEqualTo(5); // 2 + 3
    }

    @Test
    void addToCart_stockInsuffisant_echoue() {
        Plant plant = plant(1);
        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(plantRepository.findById(1L)).thenReturn(Optional.of(plant));

        assertThatThrownBy(() -> cartService.addToCart("karim@test.dz", 1L, 5))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    void updateQuantity_zero_supprimeLArticle() {
        Plant plant = plant(10);
        CartItem existing = CartItem.builder().user(user).plant(plant).quantity(2).build();

        when(userService.getByEmail("karim@test.dz")).thenReturn(user);
        when(cartItemRepository.findByUserAndPlantId(user, 1L)).thenReturn(Optional.of(existing));

        CartItem result = cartService.updateQuantity("karim@test.dz", 1L, 0);

        assertThat(result).isNull();
        verify(cartItemRepository).delete(existing);
    }
}
