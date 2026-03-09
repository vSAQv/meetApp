package org.example.repository;

import java.util.List;
import java.util.Optional;
import org.example.model.Match;
import org.example.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {

    Optional<Match> findByUser1AndUser2(UserAccount user1, UserAccount user2);

    List<Match> findByUser1OrUser2(UserAccount user1, UserAccount user2);
}

