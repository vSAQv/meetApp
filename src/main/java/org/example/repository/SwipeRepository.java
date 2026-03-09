package org.example.repository;

import java.util.List;
import java.util.Optional;
import org.example.model.Swipe;
import org.example.model.SwipeDirection;
import org.example.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SwipeRepository extends JpaRepository<Swipe, Long> {

    Optional<Swipe> findByFromUserAndToUser(UserAccount fromUser, UserAccount toUser);

    List<Swipe> findByFromUserAndDirection(UserAccount fromUser, SwipeDirection direction);
}

