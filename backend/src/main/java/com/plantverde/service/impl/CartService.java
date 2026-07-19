package com.plantverde.service.impl;

import com.plantverde.entity.CartItem;
import com.plantverde.entity.Plant;
import com.plantverde.entity.User;
import com.plantverde.exception.BusinessException;
import com.plantverde.exception.ResourceNotFoundException;
import com.plantverde.repository.CartItemRepository;
import com.plantverde.repository.PlantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final PlantRepository plantRepository;

    public List<CartItem> getCart(String email) {
        User user = getUser(email);
        return cartItemRepository.findByUser(user);
    }

    /**
     * Ajoute une plante au panier. Si elle y figure déjà, la quantité est cumulée
     * (cf. contrainte d'unicité user/plant) plutôt que dupliquée. Le stock disponible
     * est revérifié dans les deux cas.
     */
    @Transactional
    public CartItem addToCart(String email, Long plantId, int quantity) {
        User user = getUser(email);
        Plant plant = plantRepository.findById(plantId)
            .orElseThrow(() -> new ResourceNotFoundException("Plante", plantId));

        if (!plant.isActive()) throw new BusinessException("Cette plante n'est plus disponible");
        if (plant.getStock() < quantity) throw new BusinessException("Stock insuffisant");

        return cartItemRepository.findByUserAndPlantId(user, plantId)
            .map(item -> {
                int newQty = item.getQuantity() + quantity;
                if (plant.getStock() < newQty) throw new BusinessException("Stock insuffisant");
                item.setQuantity(newQty);
                return cartItemRepository.save(item);
            })
            .orElseGet(() -> cartItemRepository.save(
                CartItem.builder().user(user).plant(plant).quantity(quantity).build()
            ));
    }

    @Transactional
    public CartItem updateQuantity(String email, Long plantId, int quantity) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findByUserAndPlantId(user, plantId)
            .orElseThrow(() -> new ResourceNotFoundException("Article non trouvé dans le panier"));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        if (item.getPlant().getStock() < quantity) throw new BusinessException("Stock insuffisant");
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(String email, Long plantId) {
        User user = getUser(email);
        cartItemRepository.findByUserAndPlantId(user, plantId)
            .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void clearCart(String email) {
        cartItemRepository.deleteByUser(getUser(email));
    }

    private User getUser(String email) {
        return userService.getByEmail(email);
    }
}
