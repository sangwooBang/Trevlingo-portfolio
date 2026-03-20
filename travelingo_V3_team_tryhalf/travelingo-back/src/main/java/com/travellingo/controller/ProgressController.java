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
 * 학습 진도 컨트롤러 - 진행률 저장/조회
 * 담당: 나중현
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;

    // ========== 진행률 업데이트 (저장) ==========
    @PostMapping
    public ResponseEntity<?> updateProgress(@RequestBody ProgressUpdateDto dto) {
        // 1) 기존 진행 기록이 있는지 확인 (user + chapter + session 조합)
        UserProgress progress = progressRepository
            .findByUserIdAndChapterIdAndSessionNo(dto.getUserId(), dto.getChapterId(), dto.getSessionNo())
            .orElse(null);

        // TODO: 2) 기록이 없으면 새로 생성, 있으면 업데이트 후 저장
        // 힌트:
        //   if (progress == null) {
        //       User user = userRepository.findById(dto.getUserId()).orElseThrow();
        //       Chapter chapter = chapterRepository.findById(dto.getChapterId()).orElseThrow();
        //       progress = UserProgress.builder()
        //           .user(user)
        //           .chapter(chapter)
        //           .sessionNo(dto.getSessionNo())
        //           .build();
        //   }
        //
        //   if (dto.getStepWord() != null) progress.setStepWord(dto.getStepWord());
        //   if (dto.getStepExpr() != null) progress.setStepExpr(dto.getStepExpr());
        //   if (dto.getStepAi() != null)   progress.setStepAi(dto.getStepAi());
        //   if (dto.getStudyDuration() != null) {
        //       progress.setStudyDuration(progress.getStudyDuration() + dto.getStudyDuration());
        //   }
        //
        //   // 진행률 자동 계산 (3단계 중 완료 비율)
        //   int done = 0;
        //   if (Boolean.TRUE.equals(progress.getStepWord())) done++;
        //   if (Boolean.TRUE.equals(progress.getStepExpr())) done++;
        //   if (Boolean.TRUE.equals(progress.getStepAi()))   done++;
        //   progress.setProgressPct(done * 100 / 3);
        //   progress.setLastStudiedAt(LocalDateTime.now());
        //
        //   progressRepository.save(progress);
        //   return ResponseEntity.ok(Map.of("message", "진행률 저장 완료", "progressPct", progress.getProgressPct()));

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 사용자 전체 진행률 조회 ==========
    @GetMapping
    public ResponseEntity<?> getProgress(@RequestParam Long userId) {
        List<UserProgress> progressList = progressRepository.findByUserId(userId);

        // TODO: progressList를 Map 리스트로 변환해서 반환
        // 힌트:
        //   List<Map<String, Object>> result = progressList.stream()
        //       .map(p -> {
        //           Map<String, Object> map = new HashMap<>();
        //           map.put("chapterId", p.getChapter().getId());
        //           map.put("sessionNo", p.getSessionNo());
        //           map.put("stepWord", p.getStepWord());
        //           map.put("stepExpr", p.getStepExpr());
        //           map.put("stepAi", p.getStepAi());
        //           map.put("progressPct", p.getProgressPct());
        //           return map;
        //       }).toList();
        //   return ResponseEntity.ok(result);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
