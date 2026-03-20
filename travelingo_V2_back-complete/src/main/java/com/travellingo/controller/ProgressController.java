package com.travellingo.controller;

import com.travellingo.dto.ProgressUpdateDto;
import com.travellingo.entity.*;
import com.travellingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 학습 진도 컨트롤러
 * POST /api/progress              → 진행률 저장
 * GET  /api/progress?userId=1     → 전체 진행률 조회
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;

    // ========== 진행률 업데이트 ==========
    @PostMapping
    public ResponseEntity<?> updateProgress(@RequestBody ProgressUpdateDto dto) {
        // 1) 기존 기록 확인
        UserProgress progress = progressRepository
            .findByUserIdAndChapterIdAndSessionNo(dto.getUserId(), dto.getChapterId(), dto.getSessionNo())
            .orElse(null);

        // 2) 없으면 새로 생성
        if (progress == null) {
            User user = userRepository.findById(dto.getUserId()).orElseThrow();
            Chapter chapter = chapterRepository.findById(dto.getChapterId()).orElseThrow();
            progress = UserProgress.builder()
                .user(user)
                .chapter(chapter)
                .sessionNo(dto.getSessionNo())
                .build();
        }

        // 3) 각 단계 업데이트 (null이 아닌 값만)
        if (dto.getStepWord() != null) progress.setStepWord(dto.getStepWord());
        if (dto.getStepExpr() != null) progress.setStepExpr(dto.getStepExpr());
        if (dto.getStepAi() != null)   progress.setStepAi(dto.getStepAi());
        if (dto.getStudyDuration() != null) {
            progress.setStudyDuration(progress.getStudyDuration() + dto.getStudyDuration());
        }

        // 4) 진행률 자동 계산
        int done = 0;
        if (Boolean.TRUE.equals(progress.getStepWord())) done++;
        if (Boolean.TRUE.equals(progress.getStepExpr())) done++;
        if (Boolean.TRUE.equals(progress.getStepAi()))   done++;
        progress.setProgressPct(done * 100 / 3);
        progress.setLastStudiedAt(LocalDateTime.now());

        // 5) 저장
        progressRepository.save(progress);

        return ResponseEntity.ok(Map.of("message", "진행률 저장 완료", "progressPct", progress.getProgressPct()));
    }

    // ========== 전체 진행률 조회 ==========
    @GetMapping
    public ResponseEntity<?> getProgress(@RequestParam Long userId) {
        List<UserProgress> progressList = progressRepository.findByUserId(userId);

        List<Map<String, Object>> result = progressList.stream()
            .map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("chapterId", p.getChapter().getId());
                map.put("sessionNo", p.getSessionNo());
                map.put("stepWord", p.getStepWord());
                map.put("stepExpr", p.getStepExpr());
                map.put("stepAi", p.getStepAi());
                map.put("progressPct", p.getProgressPct());
                return map;
            }).toList();

        return ResponseEntity.ok(result);
    }
}
