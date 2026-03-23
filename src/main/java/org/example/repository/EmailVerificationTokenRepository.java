package org.example.repository;

import java.util.Optional;
import org.example.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);
}

