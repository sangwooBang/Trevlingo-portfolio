package com.travellingo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.STUDENT;

    @Column(name = "learning_lang", length = 20)
    @Builder.Default
    private String learningLang = "english";

    @Column(name = "interface_lang", length = 10)
    @Builder.Default
    private String interfaceLang = "ko";

    @Column(name = "user_level")
    @Builder.Default
    private Integer userLevel = 1;

    @Column(name = "weekly_goal")
    @Builder.Default
    private Integer weeklyGoal = 5;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Role { STUDENT, ADMIN }
}
