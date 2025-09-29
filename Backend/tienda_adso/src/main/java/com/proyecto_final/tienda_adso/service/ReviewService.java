package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.Product;
import com.proyecto_final.tienda_adso.model.Review;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsForProduct(int productId) {
        return reviewRepository.findAllByProductIdWithUsers(productId);
    }

    public Optional<Review> findById(int reviewId) {
        return reviewRepository.findById(reviewId);
    }

    public Optional<Review> findByIdAndProductId(int reviewId, int productId) {
        return reviewRepository.findByReviewIdAndProduct_ProductId(reviewId, productId);
    }

    public Review createOrUpdateReview(Product product, User user, int puntuacion, String comentario) {
        Review review = reviewRepository.findByProduct_ProductIdAndUser_UserId(product.getProductId(), user.getUserId())
                .orElseGet(() -> {
                    Review r = new Review();
                    r.setProduct(product);
                    r.setUser(user);
                    return r;
                });

        review.setPuntuacion(puntuacion);
        review.setComentario(comentario == null ? null : comentario.trim());
        review.setFecha(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public Review respondToReview(Review review, User adminUser, String respuesta) {
        review.setRespuestaAdmin(respuesta);
        review.setRespuestaFecha(LocalDateTime.now());
        review.setRespuestaAdminUser(adminUser);
        return reviewRepository.save(review);
    }

    public void deleteReview(Review review) {
        reviewRepository.delete(review);
    }
}
