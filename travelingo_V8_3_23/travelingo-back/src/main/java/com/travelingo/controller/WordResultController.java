package com.travelingo.controller;

import com.travelingo.dto.WordResultDto;
import com.travelingo.entity.*;
import com.travelingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * 단어 정오답 기록 컨트롤러
 * POST /api/word-results          -> 결과 저장 (upsert: 기존 기록 있으면 attemptCount 증가)
 * GET  /api/word-results?userId=1 -> 이력 조회
 */
@RestController
@RequestMapping("/api/word-results")
@RequiredArgsConstructor
public class WordResultController {

    private final WordResultRepository wordResultRepository;
    private final UserRepository userRepository;
    private final LearningContentRepository contentRepository;

    // ========== 정오답 저장 (Upsert) ==========
    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody WordResultDto dto) {
        User user = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다 (ID: " + dto.getUserId() + ")"));
        LearningContent content = contentRepository.findById(dto.getContentId())
            .orElseThrow(() -> new NoSuchElementException("학습 콘텐츠를 찾을 수 없습니다 (ID: " + dto.getContentId() + ")"));

        // 기존 기록이 있으면 업데이트 (upsert)
        List<WordResult> existing = wordResultRepository.findByUserIdAndContentId(
            dto.getUserId(), dto.getContentId());

        if (!existing.isEmpty()) {
            // 기존 기록 업데이트: attemptCount 증가, 최신 결과 반영
            WordResult result = existing.get(0);
            result.setAttemptCount(result.getAttemptCount() + 1);
            result.setIsCorrect(dto.getIsCorrect());
            result.setStudiedAt(LocalDateTime.now());
            wordResultRepository.save(result);
        } else {
            // 신규 기록 생성
            WordResult result = WordResult.builder()
                .user(user)
                .content(content)
                .isCorrect(dto.getIsCorrect())
                .build();
            wordResultRepository.save(result);
        }

        return ResponseEntity.ok(Map.of("message", "결과 저장 완료"));
    }

    // ========== 이력 조회 ==========
    @GetMapping
    public ResponseEntity<?> getResults(@RequestParam Long userId) {
        return ResponseEntity.ok(wordResultRepository.findByUserId(userId));
    }
}
