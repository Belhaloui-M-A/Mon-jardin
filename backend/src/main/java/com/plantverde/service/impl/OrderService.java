package com.plantverde.service.impl;

import com.plantverde.dto.response.OrderResponse;
import com.plantverde.entity.*;
import com.plantverde.exception.BusinessException;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final PlantRepository plantRepository;

    /**
     * Crée une commande depuis le panier du client.
     * Vérifie le stock et décrémente atomiquement.
     */
    @Transactional
    public OrderResponse placeOrder(String email, String deliveryAddress, String deliveryCity,
                             String deliveryPhone, String notes) {
        User user = userService.getByEmail(email);

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new BusinessException("Votre panier est vide");
        }

        // Vérification stock
        for (CartItem item : cartItems) {
            if (item.getPlant().getStock() < item.getQuantity()) {
                throw new BusinessException(
                    "Stock insuffisant pour : " + item.getPlant().getName() +
                    " (disponible : " + item.getPlant().getStock() + ")"
                );
            }
        }

        Order order = Order.builder()
            .client(user)
            .deliveryAddress(deliveryAddress)
            .deliveryCity(deliveryCity)
            .deliveryPhone(deliveryPhone)
            .notes(notes)
            .status(Order.OrderStatus.PENDING)
            .total(BigDecimal.ZERO)
            .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Plant plant = item.getPlant();
            BigDecimal unitPrice = plant.getFinalPrice();

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .plant(plant)
                .quantity(item.getQuantity())
                .unitPrice(unitPrice)
                .build();
            order.getItems().add(orderItem);
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));

            // Décrémentation du stock
            plant.setStock(plant.getStock() - item.getQuantity());
            plantRepository.save(plant);
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);

        // Vider le panier
        cartItemRepository.deleteByUser(user);

        return OrderResponse.from(saved);
    }

    public Page<OrderResponse> getMyOrders(String email, int page, int size) {
        User user = userService.getByEmail(email);
        return orderRepository.findByClientOrderByCreatedAtDesc(user, PageRequest.of(page, size))
            .map(OrderResponse::from);
    }

    public OrderResponse getById(Long id, String email, boolean isAdmin) {
        return OrderResponse.from(getEntity(id, email, isAdmin));
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
            .map(OrderResponse::from);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Commande", id));
        order.setStatus(newStatus);
        return OrderResponse.from(orderRepository.save(order));
    }

    /** Récupère l'entité (avec contrôle d'appartenance) pour les mutations internes. */
    private Order getEntity(Long id, String email, boolean isAdmin) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Commande", id));
        if (!isAdmin && !order.getClient().getEmail().equals(email)) {
            throw new BusinessException("Accès refusé à cette commande");
        }
        return order;
    }

    /**
     * Annulation par le client : interdite une fois la commande expédiée/livrée.
     * Le stock retiré au moment de la commande est restitué aux plantes concernées.
     */
    @Transactional
    public OrderResponse cancel(Long id, String email) {
        Order order = getEntity(id, email, false);
        if (order.getStatus() == Order.OrderStatus.SHIPPED ||
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Impossible d'annuler une commande déjà expédiée ou livrée");
        }
        // Remettre en stock
        order.getItems().forEach(item -> {
            Plant plant = item.getPlant();
            plant.setStock(plant.getStock() + item.getQuantity());
            plantRepository.save(plant);
        });
        order.setStatus(Order.OrderStatus.CANCELLED);
        return OrderResponse.from(orderRepository.save(order));
    }
}
