package com.proyecto_final.tienda_adso.service;

import com.proyecto_final.tienda_adso.model.*;
import com.proyecto_final.tienda_adso.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;

    @Transactional
    public Order checkoutFromCart(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setEstado(Order.OrderEstado.NUEVO);
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setCantidad(ci.getCantidad());
            oi.setPrecioUnitario(ci.getPrecioUnitario());
            oi.setId(new OrderItemId(order.getOrderId(), ci.getProduct().getProductId()));
            orderItemRepository.save(oi);

            total = total.add(ci.getPrecioUnitario().multiply(BigDecimal.valueOf(ci.getCantidad())));
        }

        order.setTotal(total);
        order = orderRepository.save(order);

        // Cerrar carrito
        cart.setEstado(Cart.CartEstado.CERRADO);
        cartRepository.save(cart);
        cartItemRepository.deleteAll(cart.getItems());

        return order;
    }

    public List<Order> findByUser(User user) { return orderRepository.findByUser(user); }
    public Order findById(int id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Orden no existe"));
    }
}
