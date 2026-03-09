package org.example.repository;

import java.util.List;
import org.example.model.Match;
import org.example.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByMatchOrderByCreatedAtAsc(Match match);
}

