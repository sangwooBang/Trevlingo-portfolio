package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConvResponseDto {
    private Long convSessionId;
    private String aiMessage;
    private String feedback;
    private String betterExpression;
    private String translation;
    private Integer messageCount;
}
