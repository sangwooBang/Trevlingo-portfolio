package com.travelingo.repository;

import com.travelingo.entity.ConvSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConvSessionRepository extends JpaRepository<ConvSession, Long> {
    List<ConvSession> findByUserIdAndChapterIdAndSessionNo(Long userId, Long chapterId, Integer sessionNo);
}
