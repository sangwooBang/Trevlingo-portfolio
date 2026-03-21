package com.travellingo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SignupRequestDto {
    private String email;
    private String password;
    private String nickname;
}
