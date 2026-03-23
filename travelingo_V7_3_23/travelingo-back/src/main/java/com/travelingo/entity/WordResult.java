package com.travelingo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "word_result")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WordResult {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private LearningContent content;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "attempt_count")
    @Builder.Default
    private Integer attemptCount = 1;

    @Column(name = "studied_at")
    @Builder.Default
    private LocalDateTime studiedAt = LocalDateTime.now();
}
