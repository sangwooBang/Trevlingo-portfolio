package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProgressUpdateDto {
    private Long userId;
    private Long chapterId;
    private Integer sessionNo;
    private Boolean stepWord;
    private Boolean stepExpr;
    private Boolean stepAi;
    private Integer studyDuration;  // 초 단위
}
