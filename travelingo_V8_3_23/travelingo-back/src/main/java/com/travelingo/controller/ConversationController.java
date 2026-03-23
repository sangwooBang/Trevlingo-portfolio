package com.travelingo.controller;

import com.travelingo.dto.*;
import com.travelingo.entity.*;
import com.travelingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI 대화 컨트롤러 - Python FastAPI AI 서버와 연동
 *
 * 엔드포인트:
 *   POST /api/conv                          -> AI 대화 전송 (대화 히스토리 + 피드백 포함)
 *   GET  /api/conv/{convSessionId}/messages -> 대화 이력 조회
 */
@RestController
@RequestMapping("/api/conv")
@RequiredArgsConstructor
public class ConversationController {

    // JPA Repository 의존성 주입
    private final ConvSessionRepository convSessionRepository;
    private final ConvMessageRepository convMessageRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;

    // RestTemplate을 static final로 공유 (매 요청마다 생성하지 않음)
    private static final RestTemplate restTemplate = new RestTemplate();

    // AI 서버 URL (application.properties에서 설정)
    @Value("${ai.server.url}")
    private String aiServerUrl;

    // ===================================================================
    // POST /api/conv -- AI 대화 전송
    // ===================================================================
    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ConvRequestDto dto) {
        ConvSession session;

        // 1단계: 대화 세션 조회 또는 생성
        if (dto.getConvSessionId() != null) {
            session = convSessionRepository.findById(dto.getConvSessionId()).orElse(null);
            if (session == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "세션을 찾을 수 없습니다"));
            }
        } else {
            User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다 (ID: " + dto.getUserId() + ")"));
            Chapter chapter = chapterRepository.findById(dto.getChapterId())
                .orElseThrow(() -> new NoSuchElementException("챕터를 찾을 수 없습니다 (ID: " + dto.getChapterId() + ")"));

            session = ConvSession.builder()
                .user(user)
                .chapter(chapter)
                .sessionNo(dto.getSessionNo())
                .persona(chapter.getPersonaSetting() != null ? chapter.getPersonaSetting() : "여행 도우미")
                .build();
            convSessionRepository.save(session);
        }

        // 2단계: 먼저 이전 대화 히스토리 DB에서 조회 (사용자 메시지 저장 전에!)
        List<ConvMessage> previousMessages = convMessageRepository
            .findByConvSessionIdOrderByCreatedAtAsc(session.getId());

        // 대화 히스토리를 AI 서버 형식으로 변환
        List<Map<String, String>> conversationHistory = previousMessages.stream()
            .map(m -> {
                Map<String, String> msg = new HashMap<>();
                msg.put("role", m.getRole().name().toLowerCase());
                msg.put("content", m.getContent());
                return msg;
            })
            .collect(Collectors.toList());

        // 3단계: 사용자 메시지를 DB에 저장 (히스토리 조회 후에!)
        ConvMessage userMsg = ConvMessage.builder()
            .convSession(session)
            .role(ConvMessage.Role.USER)
            .content(dto.getMessage())
            .build();
        convMessageRepository.save(userMsg);

        // 4단계: Python AI 서버(FastAPI)에 요청 전송
        String aiReply;
        String feedback = "";
        String betterExpression = "";
        String translation = "";

        try {
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("message", dto.getMessage());
            aiRequest.put("chapterId", dto.getChapterId());
            aiRequest.put("sessionNo", dto.getSessionNo());
            aiRequest.put("persona", session.getPersona());
            aiRequest.put("conversationHistory", conversationHistory);
            // 사용자 레벨: DTO에서 가져오되, 없으면 기본값 2 (중급)
            aiRequest.put("userLevel", dto.getUserLevel() != null ? dto.getUserLevel() : 2);

            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(
                aiServerUrl + "/api/ai/chat", aiRequest, Map.class);

            if (aiResponse != null) {
                aiReply = (String) aiResponse.getOrDefault("reply",
                    "I'm sorry, I couldn't generate a response.");
                feedback = (String) aiResponse.getOrDefault("feedback", "");
                betterExpression = (String) aiResponse.getOrDefault("betterExpression", "");
                translation = (String) aiResponse.getOrDefault("translation", "");
            } else {
                aiReply = "I'm sorry, the AI server returned an empty response.";
            }

        } catch (Exception e) {
            System.err.println("AI 서버 호출 실패: " + e.getMessage());
            aiReply = "I'm sorry, the AI server is currently unavailable. Please try again later.";
            feedback = "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
            betterExpression = "";
            translation = "";
        }

        // 5단계: AI 응답을 DB에 저장
        ConvMessage aiMsg = ConvMessage.builder()
            .convSession(session)
            .role(ConvMessage.Role.ASSISTANT)
            .content(aiReply)
            .build();
        convMessageRepository.save(aiMsg);

        // 6단계: 메시지 카운트 +2 (사용자 1 + AI 1)
        session.setMessageCount(session.getMessageCount() + 2);
        convSessionRepository.save(session);

        // 7단계: 프론트엔드에 구조화된 응답 반환
        ConvResponseDto response = ConvResponseDto.builder()
            .convSessionId(session.getId())
            .aiMessage(aiReply)
            .feedback(feedback)
            .betterExpression(betterExpression)
            .translation(translation)
            .messageCount(session.getMessageCount())
            .build();

        return ResponseEntity.ok(response);
    }

    // ===================================================================
    // GET /api/conv/{convSessionId}/messages -- 대화 이력 조회
    // ===================================================================
    @GetMapping("/{convSessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long convSessionId) {
        List<ConvMessage> messages = convMessageRepository
            .findByConvSessionIdOrderByCreatedAtAsc(convSessionId);

        List<Map<String, Object>> result = messages.stream()
            .map(m -> Map.<String, Object>of(
                "role", m.getRole().name(),
                "content", m.getContent(),
                "createdAt", m.getCreatedAt().toString()
            )).toList();

        return ResponseEntity.ok(result);
    }
}
