package com.travelingo.controller;

import com.travelingo.dto.*;
import com.travelingo.entity.Trip;
import com.travelingo.entity.User;
import com.travelingo.repository.TripRepository;
import com.travelingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * 여행 설정 컨트롤러
 * POST /api/trips        → travel-setup.js에서 호출
 * GET  /api/trips/active  → 활성 여행 조회
 */
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // ========== 여행 생성 ==========
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequestDto dto) {
        // 1) 사용자 확인
        User user = userRepository.findById(dto.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "사용자를 찾을 수 없습니다"));
        }

        // 2) Trip 생성 및 저장
        Trip trip = Trip.builder()
            .user(user)
            .destination(dto.getDestination())
            .dDay(LocalDate.parse(dto.getDDay()))   // "2026-04-26" → LocalDate
            .language(dto.getLanguage())
            .userLevel(dto.getUserLevel())
            .build();
        tripRepository.save(trip);

        // 3) 응답
        TripResponseDto response = TripResponseDto.builder()
            .tripId(trip.getId())
            .destination(trip.getDestination())
            .dDay(trip.getDDay().toString())
            .language(trip.getLanguage())
            .userLevel(trip.getUserLevel())
            .isActive(trip.getIsActive())
            .build();
        return ResponseEntity.ok(response);
    }

    // ========== 활성 여행 조회 ==========
    @GetMapping("/active")
    public ResponseEntity<?> getActiveTrip(@RequestParam Long userId) {
        Trip trip = tripRepository.findByUserIdAndIsActiveTrue(userId).orElse(null);
        if (trip == null) {
            return ResponseEntity.status(404).body(Map.of("error", "활성 여행이 없습니다"));
        }

        TripResponseDto response = TripResponseDto.builder()
            .tripId(trip.getId())
            .destination(trip.getDestination())
            .dDay(trip.getDDay().toString())
            .language(trip.getLanguage())
            .userLevel(trip.getUserLevel())
            .isActive(trip.getIsActive())
            .build();
        return ResponseEntity.ok(response);
    }
}
