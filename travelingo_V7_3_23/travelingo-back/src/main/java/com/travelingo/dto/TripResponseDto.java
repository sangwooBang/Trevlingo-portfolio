package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripResponseDto {
    private Long tripId;
    private String destination;
    private String dDay;
    private String language;
    private Integer userLevel;
    private Boolean isActive;
}
