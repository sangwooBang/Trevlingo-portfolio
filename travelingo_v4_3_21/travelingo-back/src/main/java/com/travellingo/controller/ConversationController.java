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
import java.util.stream.Collectors;

/**
 * AI 대화 컨트롤러 - Python FastAPI AI 서버와 연동
 *
 * 엔드포인트:
 *   POST /api/conv                          → AI 대화 전송 (대화 히스토리 + 피드백 포함)
 *   GET  /api/conv/{convSessionId}/messages → 대화 이력 조회
 *
 * 동작 흐름:
 *   1. 프론트엔드에서 사용자 메시지 수신
 *   2. DB에서 대화 세션 조회 또는 새로 생성
 *   3. 사용자 메시지를 DB에 저장
 *   4. 이전 대화 히스토리를 DB에서 조회
 *   5. Python AI 서버(FastAPI)에 메시지 + 히스토리 + 챕터/세션 정보 전송
 *   6. AI 서버 응답(reply, feedback, betterExpression, translation) 파싱
 *   7. AI 응답을 DB에 저장
 *   8. 프론트엔드에 구조화된 응답 반환
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

    // AI 서버 URL (application.properties에서 설정)
    // 기본값: http://localhost:8000
    @Value("${ai.server.url}")
    private String aiServerUrl;

    // ===================================================================
    // POST /api/conv — AI 대화 전송
    // ===================================================================
    /**
     * 사용자 메시지를 AI 서버에 전송하고 응답을 반환하는 메인 엔드포인트
     *
     * 요청 바디 (ConvRequestDto):
     *   - userId: 사용자 ID
     *   - chapterId: 현재 학습 중인 챕터 ID
     *   - sessionNo: 현재 세션 번호
     *   - message: 사용자가 입력한 영어 메시지
     *   - convSessionId: 기존 대화 세션 ID (null이면 새 세션 생성)
     *
     * 응답 (ConvResponseDto):
     *   - convSessionId: 대화 세션 ID
     *   - aiMessage: AI의 영어 응답
     *   - feedback: 사용자 입력에 대한 한국어 피드백
     *   - betterExpression: 더 자연스러운 영어 표현 제안
     *   - messageCount: 총 메시지 수
     *
     * @param dto 대화 요청 DTO
     * @return AI 응답이 담긴 ConvResponseDto
     */
    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ConvRequestDto dto) {
        ConvSession session;

        // ─────────────────────────────────────────
        // 1단계: 대화 세션 조회 또는 생성
        // ─────────────────────────────────────────
        if (dto.getConvSessionId() != null) {
            // 기존 세션 이어하기: convSessionId로 DB에서 조회
            session = convSessionRepository.findById(dto.getConvSessionId()).orElse(null);
            if (session == null) {
                // 세션을 찾을 수 없으면 400 에러 반환
                return ResponseEntity.badRequest().body(Map.of("error", "세션을 찾을 수 없습니다"));
            }
        } else {
            // 새 세션 생성: userId로 사용자 조회, chapterId로 챕터 조회
            User user = userRepository.findById(dto.getUserId()).orElseThrow();
            Chapter chapter = chapterRepository.findById(dto.getChapterId()).orElseThrow();

            // ConvSession 엔티티 빌더 패턴으로 생성
            session = ConvSession.builder()
                .user(user)
                .chapter(chapter)
                .sessionNo(dto.getSessionNo())
                // 챕터에 설정된 페르소나가 있으면 사용, 없으면 기본값
                .persona(chapter.getPersonaSetting() != null ? chapter.getPersonaSetting() : "여행 도우미")
                .build();
            convSessionRepository.save(session);
        }

        // ─────────────────────────────────────────
        // 2단계: 사용자 메시지를 DB에 저장
        // ─────────────────────────────────────────
        ConvMessage userMsg = ConvMessage.builder()
            .convSession(session)
            .role(ConvMessage.Role.USER)
            .content(dto.getMessage())
            .build();
        convMessageRepository.save(userMsg);

        // ─────────────────────────────────────────
        // 3단계: 이전 대화 히스토리 DB에서 조회
        // AI 서버에 문맥을 전달하기 위해 이전 메시지들을 가져옴
        // ─────────────────────────────────────────
        List<ConvMessage> previousMessages = convMessageRepository
            .findByConvSessionIdOrderByCreatedAtAsc(session.getId());

        // 대화 히스토리를 AI 서버 형식으로 변환
        // [{role: "user", content: "..."}, {role: "assistant", content: "..."}, ...]
        List<Map<String, String>> conversationHistory = previousMessages.stream()
            .map(m -> {
                Map<String, String> msg = new HashMap<>();
                // DB의 Role enum(USER/ASSISTANT)을 소문자로 변환
                msg.put("role", m.getRole().name().toLowerCase());
                msg.put("content", m.getContent());
                return msg;
            })
            .collect(Collectors.toList());

        // ─────────────────────────────────────────
        // 4단계: Python AI 서버(FastAPI)에 요청 전송
        // ─────────────────────────────────────────
        String aiReply;
        String feedback = "";
        String betterExpression = "";

        try {
            RestTemplate restTemplate = new RestTemplate();

            // AI 서버에 보낼 요청 데이터 구성
            // Python AI 서버의 ChatRequest 모델과 일치해야 함
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("message", dto.getMessage());                     // 사용자의 현재 메시지
            aiRequest.put("chapterId", dto.getChapterId());                 // 챕터 ID (페르소나 선택용)
            aiRequest.put("sessionNo", dto.getSessionNo());                 // 세션 번호
            aiRequest.put("persona", session.getPersona());                 // 페르소나 설명 텍스트
            aiRequest.put("conversationHistory", conversationHistory);      // 이전 대화 히스토리
            aiRequest.put("userLevel", 2);                                  // 사용자 레벨 (기본: 중급)

            // POST 요청: AI 서버의 /api/ai/chat 엔드포인트 호출
            // 응답 형식: {reply, feedback, betterExpression, translation}
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(
                aiServerUrl + "/api/ai/chat", aiRequest, Map.class);

            // AI 서버 응답에서 각 필드 추출
            if (aiResponse != null) {
                // reply: AI의 영어 응답 (필수)
                aiReply = (String) aiResponse.getOrDefault("reply",
                    "I'm sorry, I couldn't generate a response.");

                // feedback: 사용자 입력에 대한 한국어 피드백 (선택)
                feedback = (String) aiResponse.getOrDefault("feedback", "");

                // betterExpression: 더 자연스러운 영어 표현 제안 (선택)
                betterExpression = (String) aiResponse.getOrDefault("betterExpression", "");
            } else {
                aiReply = "I'm sorry, the AI server returned an empty response.";
            }

        } catch (Exception e) {
            // AI 서버 연결 실패 시 폴백 응답
            // 네트워크 오류, AI 서버 다운 등의 상황 처리
            System.err.println("AI 서버 호출 실패: " + e.getMessage());
            aiReply = "I'm sorry, the AI server is currently unavailable. Please try again later.";
            feedback = "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
            betterExpression = "";
        }

        // ─────────────────────────────────────────
        // 5단계: AI 응답을 DB에 저장
        // ─────────────────────────────────────────
        ConvMessage aiMsg = ConvMessage.builder()
            .convSession(session)
            .role(ConvMessage.Role.ASSISTANT)
            .content(aiReply)
            .build();
        convMessageRepository.save(aiMsg);

        // ─────────────────────────────────────────
        // 6단계: 메시지 카운트 증가 및 세션 업데이트
        // ─────────────────────────────────────────
        session.setMessageCount(session.getMessageCount() + 1);
        convSessionRepository.save(session);

        // ─────────────────────────────────────────
        // 7단계: 프론트엔드에 구조화된 응답 반환
        // ─────────────────────────────────────────
        ConvResponseDto response = ConvResponseDto.builder()
            .convSessionId(session.getId())           // 대화 세션 ID (다음 요청에서 재사용)
            .aiMessage(aiReply)                       // AI의 영어 응답
            .feedback(feedback)                       // 한국어 피드백
            .betterExpression(betterExpression)        // 더 나은 영어 표현
            .messageCount(session.getMessageCount())   // 총 메시지 수
            .build();

        return ResponseEntity.ok(response);
    }

    // ===================================================================
    // GET /api/conv/{convSessionId}/messages — 대화 이력 조회
    // ===================================================================
    /**
     * 특정 대화 세션의 전체 메시지 이력을 조회하는 엔드포인트
     *
     * @param convSessionId 대화 세션 ID
     * @return 시간순 정렬된 메시지 목록 [{role, content, createdAt}, ...]
     */
    @GetMapping("/{convSessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long convSessionId) {
        // DB에서 해당 세션의 모든 메시지를 시간순으로 조회
        List<ConvMessage> messages = convMessageRepository
            .findByConvSessionIdOrderByCreatedAtAsc(convSessionId);

        // Entity → Map 변환 (JSON 직렬화용)
        List<Map<String, Object>> result = messages.stream()
            .map(m -> Map.<String, Object>of(
                "role", m.getRole().name(),              // USER 또는 ASSISTANT
                "content", m.getContent(),                // 메시지 내용
                "createdAt", m.getCreatedAt().toString()  // 생성 시각
            )).toList();

        return ResponseEntity.ok(result);
    }
}
