package com.travelingo.repository;

import com.travelingo.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserId(Long userId);
    Optional<Trip> findByUserIdAndIsActiveTrue(Long userId);
}
