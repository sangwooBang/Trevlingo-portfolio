package com.travellingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ConvRequestDto {
    private Long userId;
    private Long chapterId;
    private Integer sessionNo;
    private String message;
    private Long convSessionId;  // 기존 세션 이어하기 (null이면 새 세션)
}
