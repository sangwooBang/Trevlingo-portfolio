"""
Travelingo AI 서버의 메인 애플리케이션 파일
FastAPI를 사용하여 Spring Boot 백엔드와 통신하는 AI 채팅 서버
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from routers import ai


# 스타트업/셧다운 lifespan 핸들러 (FastAPI 0.93+ 권장 방식, @on_event 대체)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 스타트업: static/audio 디렉토리 생성 (없으면)
    audio_dir = Path(__file__).parent / "static" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    yield
    # 셧다운: 필요 시 정리 로직 추가


# FastAPI 애플리케이션 초기화
app = FastAPI(
    title="Travelingo AI Server",
    description="여행 영어 학습을 위한 AI 대화 서버",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
# Spring Boot 백엔드(localhost:8080)와 프론트엔드(localhost:5500/127.0.0.1:5500) 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI 라우터 포함
app.include_router(ai.router)

# 정적 파일 마운트
# 오디오 파일 등 정적 자료를 제공하기 위한 설정
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


# 헬스 체크 엔드포인트
@app.get("/")
async def health_check():
    """
    서버 상태를 확인하기 위한 헬스 체크 엔드포인트
    Spring Boot 백엔드에서 주기적으로 호출하여 서버 연결 상태 확인

    Returns:
        dict: 서버 상태 정보
    """
    return {
        "status": "healthy",
        "service": "Travelingo AI Server",
        "version": "1.0.0"
    }


# 애플리케이션 실행
if __name__ == "__main__":
    import uvicorn

    # 환경 변수에서 포트 번호 읽기 (기본값: 8000)
    port = int(os.getenv("PORT", 8000))

    # Uvicorn 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
