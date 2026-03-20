package com.travellingo.controller;

import com.travellingo.entity.Chapter;
import com.travellingo.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 챕터 컨트롤러 - 언어별 챕터 목록 조회
 * 담당: 정준형
 */
@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterRepository chapterRepository;

    // ========== 언어별 챕터 목록 조회 ==========
    @GetMapping
    public ResponseEntity<?> getChapters(@RequestParam(defaultValue = "english") String language) {
        // 이미 구현됨 - 참고용
        List<Chapter> chapters = chapterRepository.findByLanguageOrderByChapterNo(language);
        return ResponseEntity.ok(chapters);
    }

    // ========== 챕터 상세 조회 ==========
    @GetMapping("/{chapterId}")
    public ResponseEntity<?> getChapter(@PathVariable Long chapterId) {
        // TODO: chapterId로 챕터 찾아서 반환, 없으면 404
        // 힌트:
        //   Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
        //   if (chapter == null) {
        //       return ResponseEntity.status(404).body(Map.of("error", "챕터를 찾을 수 없습니다"));
        //   }
        //   return ResponseEntity.ok(chapter);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
