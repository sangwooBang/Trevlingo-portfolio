package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TripRequestDto {
    private Long userId;
    private String destination;
    private String dDay;       // "2026-04-26" 형태
    private String language;
    private Integer userLevel;
}
