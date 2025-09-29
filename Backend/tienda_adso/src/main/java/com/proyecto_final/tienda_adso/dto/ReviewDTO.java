package com.proyecto_final.tienda_adso.dto;

import com.proyecto_final.tienda_adso.model.Review;

import java.time.LocalDateTime;

public record ReviewDTO(
        Integer reviewId,
        Integer productId,
        Integer userId,
        String userNombre,
        Integer puntuacion,
        String comentario,
        LocalDateTime fecha,
        String respuestaAdmin,
        LocalDateTime respuestaFecha,
        Integer respuestaAdminUserId,
        String respuestaAdminNombre
) {
    public static ReviewDTO fromEntity(Review review) {
        if (review == null) {
            return null;
        }
        return new ReviewDTO(
                review.getReviewId(),
                review.getProduct() != null ? review.getProduct().getProductId() : null,
                review.getUser() != null ? review.getUser().getUserId() : null,
                review.getUser() != null ? review.getUser().getNombre() : null,
                review.getPuntuacion(),
                review.getComentario(),
                review.getFecha(),
                review.getRespuestaAdmin(),
                review.getRespuestaFecha(),
                review.getRespuestaAdminUser() != null ? review.getRespuestaAdminUser().getUserId() : null,
                review.getRespuestaAdminUser() != null ? review.getRespuestaAdminUser().getNombre() : null
        );
    }
}
