package com.plantverde.dto.response;

import com.plantverde.entity.Order;
import com.plantverde.entity.OrderItem;
import com.plantverde.entity.Plant;
import com.plantverde.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue API d'une commande. N'expose qu'un résumé du client (jamais l'entité User
 * complète, donc jamais le hash du mot de passe) et des plantes.
 * Construite dans la couche service (transaction ouverte) : les collections LAZY
 * sont chargées au mapping, évitant toute LazyInitializationException.
 */
public record OrderResponse(
    Long id,
    ClientSummary client,
    List<OrderItemResponse> items,
    String status,
    BigDecimal total,
    String deliveryAddress,
    String deliveryCity,
    String deliveryPhone,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
            o.getId(),
            ClientSummary.from(o.getClient()),
            o.getItems().stream().map(OrderItemResponse::from).toList(),
            o.getStatus().name(),
            o.getTotal(),
            o.getDeliveryAddress(),
            o.getDeliveryCity(),
            o.getDeliveryPhone(),
            o.getNotes(),
            o.getCreatedAt(),
            o.getUpdatedAt()
        );
    }

    public record ClientSummary(Long id, String firstName, String lastName, String email) {
        static ClientSummary from(User u) {
            return new ClientSummary(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail());
        }
    }

    public record OrderItemResponse(Long id, PlantSummary plant, Integer quantity,
                                    BigDecimal unitPrice, BigDecimal subtotal) {
        static OrderItemResponse from(OrderItem i) {
            return new OrderItemResponse(i.getId(), PlantSummary.from(i.getPlant()),
                i.getQuantity(), i.getUnitPrice(), i.getSubtotal());
        }
    }

    public record PlantSummary(Long id, String name, String imageUrl, BigDecimal price) {
        static PlantSummary from(Plant p) {
            String primaryImage = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0) : null;
            return new PlantSummary(p.getId(), p.getName(), primaryImage, p.getPrice());
        }
    }
}
