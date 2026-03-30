package org.example.repository;

import java.util.List;
import org.example.model.Profile;
import org.example.model.ProfilePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfilePhotoRepository extends JpaRepository<ProfilePhoto, Long> {

    List<ProfilePhoto> findByProfile(Profile profile);

    java.util.Optional<ProfilePhoto> findFirstByProfileAndMainPhotoTrue(Profile profile);
}

