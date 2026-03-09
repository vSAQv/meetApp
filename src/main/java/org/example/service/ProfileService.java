package org.example.service;

import java.util.List;
import org.example.dto.ProfileDtos.CreateOrUpdateProfileRequest;
import org.example.dto.ProfileDtos.ProfileResponse;
import org.example.exception.EntityNotFoundException;
import org.example.model.Profile;
import org.example.model.UserAccount;
import org.example.repository.ProfileRepository;
import org.example.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserAccountRepository userAccountRepository;

    public ProfileService(ProfileRepository profileRepository,
                          UserAccountRepository userAccountRepository) {
        this.profileRepository = profileRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public ProfileResponse createProfile(Long ownerId, CreateOrUpdateProfileRequest request) {
        UserAccount owner = userAccountRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerId));

        Profile profile = new Profile();
        profile.setOwner(owner);
        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setCity(request.city());
        profile.setActive(true);

        Profile saved = profileRepository.save(profile);
        return toResponse(saved);
    }

    public List<ProfileResponse> getMyProfiles(Long ownerId) {
        UserAccount owner = userAccountRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerId));
        return profileRepository.findByOwnerAndActiveTrue(owner)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProfileResponse updateProfile(Long ownerId, Long profileId,
                                         CreateOrUpdateProfileRequest request) {
        Profile profile = getOwnedProfile(ownerId, profileId);
        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setCity(request.city());
        Profile saved = profileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional
    public void deactivateProfile(Long ownerId, Long profileId) {
        Profile profile = getOwnedProfile(ownerId, profileId);
        profile.setActive(false);
        profileRepository.save(profile);
    }

    private Profile getOwnedProfile(Long ownerId, Long profileId) {
        UserAccount owner = userAccountRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerId));
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));
        if (!profile.getOwner().getId().equals(owner.getId())) {
            throw new EntityNotFoundException("Profile does not belong to the user");
        }
        return profile;
    }

    private ProfileResponse toResponse(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getCity(),
                Boolean.TRUE.equals(profile.getActive())
        );
    }
}

