package com.travellingo.controller;

import com.travellingo.entity.CultureTip;
import com.travellingo.repository.CultureTipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 문화 팁 컨트롤러
 * 담당: 정준형
 */
@RestController
@RequestMapping("/api/culture-tips")
@RequiredArgsConstructor
public class CultureTipController {

    private final CultureTipRepository cultureTipRepository;

    // ========== 세션별 문화 팁 조회 ==========
    @GetMapping
    public ResponseEntity<?> getCultureTip(
            @RequestParam Long chapterId,
            @RequestParam Integer sessionNo) {

        // TODO: chapterId와 sessionNo로 문화 팁 조회, 없으면 404
        // 힌트:
        //   CultureTip tip = cultureTipRepository
        //       .findByChapterIdAndSessionNo(chapterId, sessionNo)
        //       .orElse(null);
        //   if (tip == null) {
        //       return ResponseEntity.status(404).body(Map.of("error", "문화 팁이 없습니다"));
        //   }
        //   return ResponseEntity.ok(Map.of(
        //       "tipKo", tip.getTipKo(),
        //       "tipEn", tip.getTipEn() != null ? tip.getTipEn() : ""
        //   ));

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
