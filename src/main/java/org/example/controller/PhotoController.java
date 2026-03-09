package org.example.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import org.example.exception.EntityNotFoundException;
import org.example.model.Profile;
import org.example.model.ProfilePhoto;
import org.example.model.UserAccount;
import org.example.repository.ProfileRepository;
import org.example.repository.UserAccountRepository;
import org.example.service.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Photo", description = "Загрузка фотографий для анкет")
@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;
    private final UserAccountRepository userAccountRepository;
    private final ProfileRepository profileRepository;

    public PhotoController(PhotoService photoService,
                           UserAccountRepository userAccountRepository,
                           ProfileRepository profileRepository) {
        this.photoService = photoService;
        this.userAccountRepository = userAccountRepository;
        this.profileRepository = profileRepository;
    }

    private void checkOwnership(Principal principal, Long profileId) {
        String username = principal.getName();
        UserAccount user = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));
        if (!profile.getOwner().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Profile does not belong to the user");
        }
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(path = "/{profileId}", consumes = "multipart/form-data")
    public ResponseEntity<ProfilePhoto> upload(
            Principal principal,
            @PathVariable Long profileId,
            @RequestPart("file") MultipartFile file
    ) {
        checkOwnership(principal, profileId);
        ProfilePhoto photo = photoService.uploadPhoto(profileId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(photo);
    }
}

