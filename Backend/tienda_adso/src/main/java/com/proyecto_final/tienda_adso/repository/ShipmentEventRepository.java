package com.proyecto_final.tienda_adso.repository;

import com.proyecto_final.tienda_adso.model.Shipment;
import com.proyecto_final.tienda_adso.model.ShipmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, Long> {

    List<ShipmentEvent> findByShipmentOrderByRegistradoEnAsc(Shipment shipment);
}
