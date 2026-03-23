package com.travelingo.repository;

import com.travelingo.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserIdAndChapterIdAndSessionNo(Long userId, Long chapterId, Integer sessionNo);
    List<UserProgress> findByUserId(Long userId);
    List<UserProgress> findByUserIdAndChapterId(Long userId, Long chapterId);
}
