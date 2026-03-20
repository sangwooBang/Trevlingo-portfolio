package com.travellingo.controller;

import com.travellingo.dto.*;
import com.travellingo.entity.Trip;
import com.travellingo.entity.User;
import com.travellingo.repository.TripRepository;
import com.travellingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * 여행 설정 컨트롤러 - 여행 생성 / 조회
 * 담당: 나중현
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
        // 1) 사용자 존재 확인
        User user = userRepository.findById(dto.getUserId())
            .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "사용자를 찾을 수 없습니다"));
        }

        // TODO: 2) Trip 엔티티 생성 후 저장하고 TripResponseDto 반환
        // 힌트:
        //   Trip trip = Trip.builder()
        //       .user(user)
        //       .destination(dto.getDestination())
        //       .dDay(LocalDate.parse(dto.getDDay()))
        //       .language(dto.getLanguage())
        //       .userLevel(dto.getUserLevel())
        //       .build();
        //   tripRepository.save(trip);
        //
        //   TripResponseDto response = TripResponseDto.builder()
        //       .tripId(trip.getId())
        //       .destination(trip.getDestination())
        //       .dDay(trip.getDDay().toString())
        //       .language(trip.getLanguage())
        //       .userLevel(trip.getUserLevel())
        //       .isActive(trip.getIsActive())
        //       .build();
        //   return ResponseEntity.ok(response);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 사용자의 활성 여행 조회 ==========
    @GetMapping("/active")
    public ResponseEntity<?> getActiveTrip(@RequestParam Long userId) {
        // TODO: userId로 활성 여행 찾아서 반환
        // 힌트:
        //   Trip trip = tripRepository.findByUserIdAndIsActiveTrue(userId)
        //       .orElse(null);
        //   if (trip == null) {
        //       return ResponseEntity.status(404).body(Map.of("error", "활성 여행이 없습니다"));
        //   }
        //   TripResponseDto response = TripResponseDto.builder()
        //       .tripId(trip.getId())
        //       .destination(trip.getDestination())
        //       .dDay(trip.getDDay().toString())
        //       .language(trip.getLanguage())
        //       .userLevel(trip.getUserLevel())
        //       .isActive(trip.getIsActive())
        //       .build();
        //   return ResponseEntity.ok(response);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
