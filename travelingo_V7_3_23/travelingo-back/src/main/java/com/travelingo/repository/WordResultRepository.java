package com.travelingo.repository;

import com.travelingo.entity.WordResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WordResultRepository extends JpaRepository<WordResult, Long> {
    List<WordResult> findByUserIdAndContentId(Long userId, Long contentId);
    List<WordResult> findByUserId(Long userId);
}
