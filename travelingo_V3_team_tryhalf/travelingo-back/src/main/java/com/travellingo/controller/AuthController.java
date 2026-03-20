package com.travellingo.controller;

import com.travellingo.dto.*;
import com.travellingo.entity.User;
import com.travellingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 인증 컨트롤러 - 회원가입 / 로그인
 * 담당: 나중현
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

        // TODO: 2) User 엔티티 생성 후 저장하고 성공 응답 반환
        // 힌트:
        //   User user = User.builder()
        //       .email(dto.getEmail())
        //       .password(dto.getPassword())
        //       .nickname(dto.getNickname())
        //       .build();
        //   userRepository.save(user);
        //   return ResponseEntity.ok(Map.of("message", "회원가입 성공", "userId", user.getId()));

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 로그인 ==========
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto dto) {
        // 1) 이메일로 사용자 찾기
        User user = userRepository.findByEmail(dto.getEmail())
            .orElse(null);

        // TODO: 2) user가 null이면 404 반환, 비밀번호 틀리면 401 반환, 성공이면 LoginResponseDto 반환
        // 힌트:
        //   if (user == null) {
        //       return ResponseEntity.status(404).body(Map.of("error", "존재하지 않는 이메일"));
        //   }
        //   if (!user.getPassword().equals(dto.getPassword())) {
        //       return ResponseEntity.status(401).body(Map.of("error", "비밀번호가 틀립니다"));
        //   }
        //   LoginResponseDto response = LoginResponseDto.builder()
        //       .userId(user.getId())
        //       .email(user.getEmail())
        //       .nickname(user.getNickname())
        //       .message("로그인 성공")
        //       .build();
        //   return ResponseEntity.ok(response);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
