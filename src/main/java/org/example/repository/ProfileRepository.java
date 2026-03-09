package org.example.repository;

import java.util.List;
import org.example.model.Profile;
import org.example.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findByOwnerAndActiveTrue(UserAccount owner);

    List<Profile> findByActiveTrue();
}

