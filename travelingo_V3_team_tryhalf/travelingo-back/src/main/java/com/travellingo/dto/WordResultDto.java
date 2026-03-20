package com.travellingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WordResultDto {
    private Long userId;
    private Long contentId;
    private Boolean isCorrect;
}
