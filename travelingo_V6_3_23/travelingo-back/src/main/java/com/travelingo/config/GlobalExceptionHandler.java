package com.travelingo.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 전역 예외 처리기 - 모든 Controller에서 발생하는 예외를 잡아서 깔끔한 JSON 응답 반환
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException e) {
        return ResponseEntity.badRequest().body(
            Map.of("error", e.getMessage())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        return ResponseEntity.internalServerError().body(
            Map.of("error", "서버 오류가 발생했습니다", "detail", e.getMessage())
        );
    }
}
