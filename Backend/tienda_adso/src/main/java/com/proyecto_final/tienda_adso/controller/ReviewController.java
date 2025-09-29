package com.proyecto_final.tienda_adso.controller;

import com.proyecto_final.tienda_adso.dto.ReviewDTO;
import com.proyecto_final.tienda_adso.dto.ReviewRequest;
import com.proyecto_final.tienda_adso.dto.ReviewResponseRequest;
import com.proyecto_final.tienda_adso.model.Product;
import com.proyecto_final.tienda_adso.model.Review;
import com.proyecto_final.tienda_adso.model.User;
import com.proyecto_final.tienda_adso.service.ProductService;
import com.proyecto_final.tienda_adso.service.ReviewService;
import com.proyecto_final.tienda_adso.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "https://unamazedly-demure-veola.ngrok-free.dev"})
public class ReviewController {

    private final ReviewService reviewService;
    private final ProductService productService;
    private final UserService userService;

    public ReviewController(ReviewService reviewService,
                            ProductService productService,
                            UserService userService) {
        this.reviewService = reviewService;
        this.productService = productService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewDTO>> list(@PathVariable int productId) {
        ensureProductExists(productId);
        List<ReviewDTO> reviews = reviewService.getReviewsForProduct(productId)
                .stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewDTO> create(@PathVariable int productId,
                                            @Valid @RequestBody ReviewRequest request,
                                            Authentication authentication) {
        Product product = ensureProductExists(productId);
        User user = resolveUser(authentication);

        Review saved = reviewService.createOrUpdateReview(
                product,
                user,
                request.getPuntuacion(),
                request.getComentario().trim()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReviewDTO.fromEntity(saved));
    }

    @PatchMapping("/{reviewId}/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> respond(@PathVariable int productId,
                                             @PathVariable int reviewId,
                                             @Valid @RequestBody ReviewResponseRequest request,
                                             Authentication authentication) {
        ensureProductExists(productId);
        Review review = findReviewBelongingToProduct(productId, reviewId);
        User admin = resolveUser(authentication);

        Review updated = reviewService.respondToReview(review, admin, request.getRespuesta().trim());
        return ResponseEntity.ok(ReviewDTO.fromEntity(updated));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable int productId,
                                       @PathVariable int reviewId) {
        ensureProductExists(productId);
        Review review = findReviewBelongingToProduct(productId, reviewId);
        reviewService.deleteReview(review);
        return ResponseEntity.noContent().build();
    }

    private Product ensureProductExists(int productId) {
        return productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Review findReviewBelongingToProduct(int productId, int reviewId) {
        return reviewService.findByIdAndProductId(reviewId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada"));
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida");
        }
        String email = authentication.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));
    }
}
