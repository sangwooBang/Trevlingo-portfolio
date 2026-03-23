package com.travelingo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "chapter_id", "session_no"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProgress {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "session_no", nullable = false)
    private Integer sessionNo;

    @Column(name = "step_word")
    @Builder.Default
    private Boolean stepWord = false;

    @Column(name = "step_expr")
    @Builder.Default
    private Boolean stepExpr = false;

    @Column(name = "step_ai")
    @Builder.Default
    private Boolean stepAi = false;

    @Column(name = "progress_pct")
    @Builder.Default
    private Integer progressPct = 0;

    @Column(name = "last_studied_at")
    private LocalDateTime lastStudiedAt;

    @Column(name = "study_duration")
    @Builder.Default
    private Integer studyDuration = 0;
}
