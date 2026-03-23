package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ConvRequestDto {
    private Long userId;
    private Long chapterId;
    private Integer sessionNo;
    private String message;
    private Long convSessionId;  // 기존 세션 이어하기 (null이면 새 세션)
    private Integer userLevel;   // 사용자 레벨 (1=초급, 2=중급, 3=고급)
}
