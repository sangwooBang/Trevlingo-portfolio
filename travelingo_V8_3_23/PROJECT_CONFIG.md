# Travelingo 프로젝트 기준 설정
# ================================
# 이 파일은 프로젝트 전체의 기준 설정입니다.
# 새 버전 생성 시 반드시 이 설정을 확인하세요.

## Java
- Java 21

## Spring Boot
- Spring Boot 3.5.11
- io.spring.dependency-management 1.1.7

## MySQL (캠퍼스 서버)
- 서버종류: MySQL 8.0.26
- URL: project-db-campus.smhrd.com
- 포트: 3307
- DB(스키마): campus_24KDT_LI8_p2_3
- 계정명: campus_24KDT_LI8_p2_3
- 비밀번호: smhrd3

## 이름 규칙
- 프로젝트명: travelingo (NOT travellingo, NOT TravelLingo)
- 패키지명: com.travelingo
- 메인 클래스: TravelingoApplication

## 아키텍처
- 프론트: VS Code Live Server (포트 5500)
- 백엔드: Spring Boot (포트 8080)
- AI 서버: Python FastAPI (포트 8000)
- 흐름: 프론트(5500) → 백엔드(8080) → AI서버(8000)

## Entity ID 타입
- 모든 PK/FK: BIGINT (Java Long)
- schema.sql과 Entity 반드시 일치시킬 것

## JPA
- ddl-auto: update
- DB 컬럼 타입과 Entity 타입 불일치 주의 (INT vs BIGINT)
