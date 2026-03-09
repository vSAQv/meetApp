package org.example.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.example.config.PhotoStorageProperties;
import org.example.exception.EntityNotFoundException;
import org.example.model.Profile;
import org.example.model.ProfilePhoto;
import org.example.repository.ProfilePhotoRepository;
import org.example.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PhotoService {

    private final PhotoStorageProperties properties;
    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository profilePhotoRepository;

    public PhotoService(PhotoStorageProperties properties,
                        ProfileRepository profileRepository,
                        ProfilePhotoRepository profilePhotoRepository) {
        this.properties = properties;
        this.profileRepository = profileRepository;
        this.profilePhotoRepository = profilePhotoRepository;
    }

    @Transactional
    public ProfilePhoto uploadPhoto(Long profileId, MultipartFile file) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));

        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path uploadPath = Paths.get(properties.getUploadDir());
        try {
            Files.createDirectories(uploadPath);
            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        ProfilePhoto photo = new ProfilePhoto();
        photo.setProfile(profile);
        photo.setUrl("/photos/" + filename);
        photo.setMainPhoto(false);

        return profilePhotoRepository.save(photo);
    }
}

