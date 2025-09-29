package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("select r from Review r " +
            "left join fetch r.user u " +
            "left join fetch r.respuestaAdminUser au " +
            "where r.product.productId = :productId " +
            "order by r.fecha desc")
    List<Review> findAllByProductIdWithUsers(@Param("productId") int productId);

    Optional<Review> findByProduct_ProductIdAndUser_UserId(int productId, int userId);

    Optional<Review> findByReviewIdAndProduct_ProductId(int reviewId, int productId);
}
