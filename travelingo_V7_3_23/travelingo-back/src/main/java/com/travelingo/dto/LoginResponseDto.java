package com.travelingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String message;
}
