package com.travellingo.controller;

import com.travellingo.dto.WordResultDto;
import com.travellingo.entity.*;
import com.travellingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 단어 정오답 기록 컨트롤러
 * 담당: 정준형
 */
@RestController
@RequestMapping("/api/word-results")
@RequiredArgsConstructor
public class WordResultController {

    private final WordResultRepository wordResultRepository;
    private final UserRepository userRepository;
    private final LearningContentRepository contentRepository;

    // ========== 정오답 기록 저장 ==========
    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody WordResultDto dto) {
        // TODO: User와 LearningContent를 찾아서 WordResult 생성 후 저장
        // 힌트:
        //   User user = userRepository.findById(dto.getUserId()).orElseThrow();
        //   LearningContent content = contentRepository.findById(dto.getContentId()).orElseThrow();
        //
        //   WordResult result = WordResult.builder()
        //       .user(user)
        //       .content(content)
        //       .isCorrect(dto.getIsCorrect())
        //       .build();
        //   wordResultRepository.save(result);
        //
        //   return ResponseEntity.ok(Map.of("message", "결과 저장 완료"));

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 사용자의 정오답 이력 조회 ==========
    @GetMapping
    public ResponseEntity<?> getResults(@RequestParam Long userId) {
        // TODO: userId로 전체 이력 조회 후 반환
        // 힌트: wordResultRepository.findByUserId(userId) 사용

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
