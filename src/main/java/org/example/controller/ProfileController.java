package org.example.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.example.dto.ProfileDtos.CreateOrUpdateProfileRequest;
import org.example.dto.ProfileDtos.CandidateProfileResponse;
import org.example.dto.ProfileDtos.ProfileResponse;
import org.example.exception.EntityNotFoundException;
import org.example.model.UserAccount;
import org.example.repository.UserAccountRepository;
import org.example.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Profile", description = "Анкеты пользователей")
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final UserAccountRepository userAccountRepository;

    public ProfileController(ProfileService profileService,
                             UserAccountRepository userAccountRepository) {
        this.profileService = profileService;
        this.userAccountRepository = userAccountRepository;
    }

    private Long currentUserId(Principal principal) {
        String username = principal.getName();
        UserAccount user = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        return user.getId();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ProfileResponse> create(
            Principal principal,
            @RequestBody @Valid CreateOrUpdateProfileRequest request
    ) {
        Long userId = currentUserId(principal);
        ProfileResponse response = profileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me")
    public ResponseEntity<List<ProfileResponse>> myProfiles(Principal principal) {
        Long userId = currentUserId(principal);
        List<ProfileResponse> list = profileService.getMyProfiles(userId);
        return ResponseEntity.ok(list);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfileResponse> update(
            Principal principal,
            @PathVariable Long id,
            @RequestBody @Valid CreateOrUpdateProfileRequest request
    ) {
        Long userId = currentUserId(principal);
        ProfileResponse response = profileService.updateProfile(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(
            Principal principal,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(principal);
        profileService.deactivateProfile(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/recommendations")
    public ResponseEntity<List<CandidateProfileResponse>> recommendations(
            Principal principal
    ) {
        Long userId = currentUserId(principal);
        // Для UI достаточно небольшой выборки; при необходимости сделаем пагинацию.
        List<CandidateProfileResponse> list = profileService.getRecommendedProfiles(userId, 20);
        return ResponseEntity.ok(list);
    }
}

