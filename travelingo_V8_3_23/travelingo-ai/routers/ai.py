"""
AI 채팅 라우터 모듈
Spring Boot 백엔드로부터의 POST 요청을 처리하고 AI 응답 생성
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
from openai import OpenAI
from services.persona import get_system_prompt, get_persona_description
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 라우터 생성
router = APIRouter(prefix="/api", tags=["AI"])

# OpenAI 클라이언트 초기화
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다")
client = OpenAI(api_key=openai_api_key)


# ============================================
# Pydantic 모델 정의
# ============================================

class ConversationMessage(BaseModel):
    """
    대화 히스토리 메시지 모델

    Attributes:
        role: 메시지 발화자 역할 (user 또는 assistant)
        content: 메시지 내용
    """
    role: str = Field(..., description="메시지 역할 (user/assistant)")
    content: str = Field(..., description="메시지 내용")


class ChatRequest(BaseModel):
    """
    Spring Boot 백엔드로부터 받는 채팅 요청 모델

    Attributes:
        message: 사용자의 영어 메시지
        chapterId: 현재 챕터 ID (1-10)
        sessionNo: 현재 세션 번호
        persona: 페르소나 설명 텍스트
        conversationHistory: 이전 대화 히스토리
        userLevel: 사용자 레벨 (1=초급, 2=중급, 3=고급)
    """
    message: str = Field(..., description="사용자의 영어 메시지")
    chapterId: int = Field(..., description="챕터 ID (1-10)")
    sessionNo: int = Field(..., description="세션 번호")
    persona: Optional[str] = Field(None, description="페르소나 설명")
    conversationHistory: Optional[List[ConversationMessage]] = Field(
        default_factory=list,
        description="이전 대화 히스토리"
    )
    userLevel: int = Field(default=2, description="사용자 레벨 (1-3)")


class ChatResponse(BaseModel):
    """
    AI 서버의 채팅 응답 모델

    Attributes:
        reply: AI의 영어 응답
        feedback: 사용자 입력에 대한 한국어 피드백 (교정/칭찬)
        betterExpression: 더 자연스러운 영어 표현 제안
        translation: AI 응답의 한국어 번역
    """
    reply: str = Field(..., description="AI의 영어 응답")
    feedback: str = Field(..., description="한국어 피드백")
    betterExpression: str = Field(..., description="더 자연스러운 영어 표현")
    translation: str = Field(..., description="응답의 한국어 번역")


# ============================================
# 메인 채팅 엔드포인트
# ============================================

@router.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    사용자의 메시지를 받아 AI 응답을 생성하는 메인 엔드포인트

    이 함수는:
    1. 요청에서 페르소나 정보를 로드
    2. OpenAI 메시지 배열을 구성 (시스템 프롬프트 + 대화 히스토리 + 사용자 메시지)
    3. OpenAI API를 호출하여 AI 응답 생성
    4. 응답을 파싱하여 구조화된 데이터로 변환
    5. 클라이언트에게 최종 응답 반환

    Args:
        request: ChatRequest 모델의 요청 객체

    Returns:
        ChatResponse: 4개 필드를 포함한 구조화된 응답

    Raises:
        HTTPException: OpenAI API 호출 실패 시 500 에러 반환
    """

    try:
        # ========================================
        # 1. 페르소나 정보 로드
        # ========================================

        # 요청의 persona 필드가 비어있으면 chapterId로 기본 페르소나 로드
        persona = request.persona
        if not persona or persona.strip() == "":
            persona = get_persona_description(request.chapterId)

        # ========================================
        # 2. OpenAI 메시지 배열 구성
        # ========================================

        # 시스템 프롬프트 생성
        # 사용자 레벨에 따라 난이도 조절된 시스템 프롬프트 생성
        system_prompt = get_system_prompt(persona, request.userLevel)

        # 메시지 배열 초기화 (시스템 메시지 포함)
        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]

        # 대화 히스토리 추가 (최근 10개 메시지만 포함)
        # 토큰 사용량을 줄이고 최신 문맥 유지
        if request.conversationHistory:
            # 최근 10개 메시지만 추출
            recent_history = request.conversationHistory[-10:]
            for msg in recent_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # 현재 사용자 메시지 추가
        messages.append({
            "role": "user",
            "content": request.message
        })

        # ========================================
        # 3. OpenAI API 호출
        # ========================================

        # OpenAI Chat Completions API 호출
        # gpt-4o-mini 모델 사용 (비용 효율적)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        # API 응답에서 AI의 생성 텍스트 추출
        ai_response_text = response.choices[0].message.content.strip()

        # ========================================
        # 4. 응답 파싱
        # ========================================

        # AI 응답을 JSON 형식으로 파싱 시도
        parsed_response = _parse_ai_response(ai_response_text)

        # 파싱된 데이터로 응답 객체 생성
        return ChatResponse(
            reply=parsed_response.get("reply", ai_response_text),
            feedback=parsed_response.get("feedback", "좋은 시도입니다!"),
            betterExpression=parsed_response.get("betterExpression", request.message),
            translation=parsed_response.get("translation", "번역을 생성할 수 없습니다.")
        )

    except Exception as e:
        # 예외 발생 시 에러 로깅 및 500 에러 반환 (Spring Boot 호출자에게 에러 전달)
        print(f"AI 채팅 엔드포인트 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 응답 생성 실패: {str(e)}")


# ============================================
# 헬퍼 함수
# ============================================

def _parse_ai_response(response_text: str) -> dict:
    """
    AI의 응답 텍스트를 파싱하여 4개의 필드를 추출하는 함수

    AI는 다음 형식으로 응답하도록 지시됨:
    JSON 형식 또는 텍스트 형식으로 reply, feedback, betterExpression, translation 포함

    Args:
        response_text: OpenAI API로부터 받은 원본 응답 텍스트

    Returns:
        dict: 파싱된 응답 데이터
            - reply: AI의 영어 응답
            - feedback: 한국어 피드백
            - betterExpression: 더 자연스러운 영어 표현
            - translation: 한국어 번역
    """

    try:
        # JSON 형식의 응답 파싱 시도
        # AI가 JSON 형식으로 응답했을 경우 처리

        # 응답 텍스트에서 JSON 부분 추출
        # "```json" 블록이 있을 경우 제거
        json_str = response_text
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]

        # JSON 파싱
        parsed = json.loads(json_str)

        # 필요한 필드 추출 (기본값 설정)
        return {
            "reply": parsed.get("reply", ""),
            "feedback": parsed.get("feedback", "좋은 시도입니다!"),
            "betterExpression": parsed.get("betterExpression", ""),
            "translation": parsed.get("translation", "")
        }

    except (json.JSONDecodeError, KeyError, IndexError):
        # JSON 파싱 실패 시 텍스트에서 필드 추출 시도
        # 구조화된 응답이 없을 경우 기본값 사용
        return {
            "reply": response_text,
            "feedback": "좋은 시도입니다!",
            "betterExpression": "",
            "translation": ""
        }
