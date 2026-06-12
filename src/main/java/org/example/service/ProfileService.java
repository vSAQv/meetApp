package org.example.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.example.dto.ProfileDtos.CreateOrUpdateProfileRequest;
import org.example.dto.ProfileDtos.CandidateProfileResponse;
import org.example.dto.ProfileDtos.ProfileResponse;
import org.example.exception.EntityNotFoundException;
import org.example.model.Gender;
import org.example.model.Profile;
import org.example.model.ProfilePhoto;
import org.example.model.SwipeDirection;
import org.example.model.UserAccount;
import org.example.repository.ProfileRepository;
import org.example.repository.ProfilePhotoRepository;
import org.example.repository.SwipeRepository;
import org.example.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserAccountRepository userAccountRepository;
    private final ProfilePhotoRepository profilePhotoRepository;
    private final SwipeRepository swipeRepository;

    public ProfileService(ProfileRepository profileRepository,
                          UserAccountRepository userAccountRepository,
                          ProfilePhotoRepository profilePhotoRepository,
                          SwipeRepository swipeRepository) {
        this.profileRepository = profileRepository;
        this.userAccountRepository = userAccountRepository;
        this.profilePhotoRepository = profilePhotoRepository;
        this.swipeRepository = swipeRepository;
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
        String photoUrl = profilePhotoRepository.findByProfile(profile).stream()
                .findFirst()
                .map(ProfilePhoto::getUrl)
                .orElse(null);

        return new ProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getCity(),
                Boolean.TRUE.equals(profile.getActive()),
                photoUrl
        );
    }

    @Transactional(readOnly = true)
    public List<CandidateProfileResponse> getRecommendedProfiles(Long ownerId, int limit) {
        UserAccount owner = userAccountRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerId));

        // 1. Получаем ID тех, кого уже лайкнули (их больше не показываем никогда)
        Set<Long> likedIds = swipeRepository.findByFromUserAndDirection(owner, SwipeDirection.LIKE)
                .stream().map(s -> s.getToUser().getId()).collect(Collectors.toSet());

        // 2. Получаем ID тех, кого дизлайкнули (их покажем по кругу, если закончатся новые)
        Set<Long> dislikedIds = swipeRepository.findByFromUserAndDirection(owner, SwipeDirection.DISLIKE)
                .stream().map(s -> s.getToUser().getId()).collect(Collectors.toSet());

        List<Profile> allActive = profileRepository.findByActiveTrue();

        // 3. Ищем новые (ни разу не свайпнутые) анкеты
        List<Profile> candidates = allActive.stream()
                .filter(p -> !p.getOwner().getId().equals(owner.getId()))
                .filter(p -> !likedIds.contains(p.getOwner().getId()))
                .filter(p -> !dislikedIds.contains(p.getOwner().getId()))
                .filter(p -> isGenderMatch(owner, p.getOwner()))
                .limit(Math.max(limit, 1))
                .collect(Collectors.toList());

        // 4. Если новые закончились, добиваем список дизлайками (идут по кругу)
        if (candidates.size() < limit) {
            List<Profile> recycled = allActive.stream()
                    .filter(p -> !p.getOwner().getId().equals(owner.getId()))
                    .filter(p -> !likedIds.contains(p.getOwner().getId())) // Лайки по-прежнему исключены
                    .filter(p -> dislikedIds.contains(p.getOwner().getId())) // Берем только дизлайки
                    .filter(p -> isGenderMatch(owner, p.getOwner()))
                    .limit(limit - candidates.size())
                    .toList();
            candidates.addAll(recycled);
        }

        return candidates.stream()
                .map(this::toCandidateResponse)
                .collect(Collectors.toList());
    }

    private boolean isGenderMatch(UserAccount searcher, UserAccount candidate) {
        // Если ищет OTHER, показываем всех (MALE, FEMALE, OTHER)
        if (searcher.getLookingForGender() == Gender.OTHER) {
            return true;
        }
        return searcher.getLookingForGender() == candidate.getGender();
    }

    private CandidateProfileResponse toCandidateResponse(Profile profile) {
        ProfilePhoto mainPhoto = profilePhotoRepository
                .findByProfile(profile).stream().findFirst()
                .orElse(null);

        String photoUrl = mainPhoto != null ? mainPhoto.getUrl() : null;
        return new CandidateProfileResponse(
                profile.getId(),
                profile.getOwner().getId(), // ДОБАВЛЕНО: берем ID владельца
                profile.getDisplayName(),
                profile.getBio(),
                profile.getCity(),
                photoUrl
        );
    }

   
}