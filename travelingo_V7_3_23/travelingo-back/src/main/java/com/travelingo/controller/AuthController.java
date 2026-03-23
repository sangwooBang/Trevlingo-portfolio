package com.travelingo.controller;

import com.travelingo.dto.*;
import com.travelingo.entity.User;
import com.travelingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 인증 컨트롤러 - 회원가입 / 로그인
 * POST /api/auth/signup  → signup.html에서 호출
 * POST /api/auth/login   → login.html에서 호출
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    // ========== 회원가입 ==========
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDto dto) {
        // 1) 이메일 중복 확인
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "이미 가입된 이메일입니다"));
        }

        // 2) User 엔티티 생성 (Builder 패턴)
        User user = User.builder()
            .email(dto.getEmail())
            .password(dto.getPassword())    // 수업 프로젝트: 평문 저장 (실무에선 BCrypt)
            .nickname(dto.getNickname())
            .build();

        // 3) DB 저장
        userRepository.save(user);

        // 4) 성공 응답
        return ResponseEntity.ok(Map.of("message", "회원가입 성공", "userId", user.getId()));
    }

    // ========== 로그인 ==========
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto dto) {
        // 1) 이메일로 사용자 찾기
        User user = userRepository.findByEmail(dto.getEmail())
            .orElse(null);

        // 2) 이메일 없음
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "존재하지 않는 이메일"));
        }

        // 3) 비밀번호 확인
        if (!user.getPassword().equals(dto.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "비밀번호가 틀립니다"));
        }

        // 4) 성공 응답 (비밀번호 절대 반환 금지!)
        LoginResponseDto response = LoginResponseDto.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .message("로그인 성공")
            .build();

        return ResponseEntity.ok(response);
    }
}
