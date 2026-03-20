package com.travellingo.controller;

import com.travellingo.dto.LearningContentDto;
import com.travellingo.entity.LearningContent;
import com.travellingo.repository.LearningContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 학습 콘텐츠 컨트롤러 - 단어/표현/QNA 조회
 * 담당: 정준형
 */
@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class LearningContentController {

    private final LearningContentRepository contentRepository;

    // ========== 챕터+세션별 학습 콘텐츠 조회 ==========
    @GetMapping
    public ResponseEntity<?> getContents(
            @RequestParam Long chapterId,
            @RequestParam Integer sessionNo) {

        List<LearningContent> contents = contentRepository
            .findByChapterIdAndSessionNo(chapterId, sessionNo);

        // TODO: Entity → DTO 변환 후 반환
        // 힌트:
        //   List<LearningContentDto> dtoList = contents.stream()
        //       .map(c -> LearningContentDto.builder()
        //           .id(c.getId())
        //           .sessionNo(c.getSessionNo())
        //           .sessionName(c.getSessionName())
        //           .type(c.getType().name())
        //           .priority(c.getPriority())
        //           .contentEn(c.getContentEn())
        //           .contentKo(c.getContentKo())
        //           .exampleEn(c.getExampleEn())
        //           .exampleKo(c.getExampleKo())
        //           .qnaQEn(c.getQnaQEn())
        //           .qnaAEn(c.getQnaAEn())
        //           .qnaQKo(c.getQnaQKo())
        //           .qnaAKo(c.getQnaAKo())
        //           .build())
        //       .collect(Collectors.toList());
        //   return ResponseEntity.ok(dtoList);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 챕터 전체 콘텐츠 조회 ==========
    @GetMapping("/all")
    public ResponseEntity<?> getAllByChapter(@RequestParam Long chapterId) {
        // TODO: chapterId로 전체 콘텐츠 조회 후 반환
        // 힌트: contentRepository.findByChapterId(chapterId) 사용
        //   위 getContents와 같은 방식으로 DTO 변환

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
