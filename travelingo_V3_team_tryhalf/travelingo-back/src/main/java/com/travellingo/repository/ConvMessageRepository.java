package com.travellingo.repository;

import com.travellingo.entity.ConvMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConvMessageRepository extends JpaRepository<ConvMessage, Long> {
    List<ConvMessage> findByConvSessionIdOrderByCreatedAtAsc(Long convSessionId);
}
