package com.travellingo.controller;

import com.travellingo.dto.*;
import com.travellingo.entity.*;
import com.travellingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AI 대화 컨트롤러 - Python FastAPI 서버와 연동
 * 담당: 나중현 (AI 서버는 박현석이 관리)
 */
@RestController
@RequestMapping("/api/conv")
@RequiredArgsConstructor
public class ConversationController {

    private final ConvSessionRepository convSessionRepository;
    private final ConvMessageRepository convMessageRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    // ========== AI 대화 전송 ==========
    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ConvRequestDto dto) {
        ConvSession session;

        // 1) 기존 세션 이어하기 vs 새 세션 생성
        if (dto.getConvSessionId() != null) {
            session = convSessionRepository.findById(dto.getConvSessionId()).orElse(null);
            if (session == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "세션을 찾을 수 없습니다"));
            }
        } else {
            // TODO: 새 ConvSession 생성
            // 힌트:
            //   User user = userRepository.findById(dto.getUserId()).orElseThrow();
            //   Chapter chapter = chapterRepository.findById(dto.getChapterId()).orElseThrow();
            //   session = ConvSession.builder()
            //       .user(user)
            //       .chapter(chapter)
            //       .sessionNo(dto.getSessionNo())
            //       .persona(chapter.getPersonaSetting() != null ? chapter.getPersonaSetting() : "여행 도우미")
            //       .build();
            //   convSessionRepository.save(session);

            session = null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
        }

        // TODO: 2) 사용자 메시지 저장
        // 힌트:
        //   ConvMessage userMsg = ConvMessage.builder()
        //       .convSession(session)
        //       .role(ConvMessage.Role.USER)
        //       .content(dto.getMessage())
        //       .build();
        //   convMessageRepository.save(userMsg);

        // TODO: 3) AI 서버 호출 (Python FastAPI)
        // 힌트:
        //   RestTemplate restTemplate = new RestTemplate();
        //   Map<String, Object> aiRequest = new HashMap<>();
        //   aiRequest.put("message", dto.getMessage());
        //   aiRequest.put("persona", session.getPersona());
        //   // AI 서버에 POST 요청
        //   // Map aiResponse = restTemplate.postForObject(aiServerUrl + "/api/ai/chat", aiRequest, Map.class);
        //   // String aiReply = (String) aiResponse.get("reply");

        // TODO: 4) AI 응답 메시지 저장 + 메시지 카운트 증가
        // 힌트:
        //   ConvMessage aiMsg = ConvMessage.builder()
        //       .convSession(session)
        //       .role(ConvMessage.Role.ASSISTANT)
        //       .content(aiReply)
        //       .build();
        //   convMessageRepository.save(aiMsg);
        //   session.setMessageCount(session.getMessageCount() + 1);
        //   convSessionRepository.save(session);

        // TODO: 5) ConvResponseDto 반환
        // 힌트:
        //   ConvResponseDto response = ConvResponseDto.builder()
        //       .convSessionId(session.getId())
        //       .aiMessage(aiReply)
        //       .messageCount(session.getMessageCount())
        //       .build();
        //   return ResponseEntity.ok(response);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }

    // ========== 대화 이력 조회 ==========
    @GetMapping("/{convSessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long convSessionId) {
        // TODO: convSessionId로 메시지 목록 조회 후 반환
        // 힌트:
        //   List<ConvMessage> messages = convMessageRepository
        //       .findByConvSessionIdOrderByCreatedAtAsc(convSessionId);
        //   List<Map<String, Object>> result = messages.stream()
        //       .map(m -> Map.<String, Object>of(
        //           "role", m.getRole().name(),
        //           "content", m.getContent(),
        //           "createdAt", m.getCreatedAt().toString()
        //       )).toList();
        //   return ResponseEntity.ok(result);

        return null; // ← 이 줄 삭제하고 위 힌트를 완성하세요
    }
}
