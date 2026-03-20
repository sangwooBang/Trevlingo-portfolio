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
 * POST /api/word-results          → 결과 저장
 * GET  /api/word-results?userId=1 → 이력 조회
 */
@RestController
@RequestMapping("/api/word-results")
@RequiredArgsConstructor
public class WordResultController {

    private final WordResultRepository wordResultRepository;
    private final UserRepository userRepository;
    private final LearningContentRepository contentRepository;

    // ========== 정오답 저장 ==========
    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody WordResultDto dto) {
        User user = userRepository.findById(dto.getUserId()).orElseThrow();
        LearningContent content = contentRepository.findById(dto.getContentId()).orElseThrow();

        WordResult result = WordResult.builder()
            .user(user)
            .content(content)
            .isCorrect(dto.getIsCorrect())
            .build();
        wordResultRepository.save(result);

        return ResponseEntity.ok(Map.of("message", "결과 저장 완료"));
    }

    // ========== 이력 조회 ==========
    @GetMapping
    public ResponseEntity<?> getResults(@RequestParam Long userId) {
        return ResponseEntity.ok(wordResultRepository.findByUserId(userId));
    }
}
