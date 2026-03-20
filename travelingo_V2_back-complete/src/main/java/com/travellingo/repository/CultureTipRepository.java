package com.travellingo.repository;

import com.travellingo.entity.CultureTip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CultureTipRepository extends JpaRepository<CultureTip, Long> {
    Optional<CultureTip> findByChapterIdAndSessionNo(Long chapterId, Integer sessionNo);
}
