package org.example.service;

import java.util.List;
import org.example.dto.SwipeDtos.MatchResponse;
import org.example.dto.SwipeDtos.SwipeRequest;
import org.example.exception.BadRequestException;
import org.example.exception.EntityNotFoundException;
import org.example.model.Match;
import org.example.model.Swipe;
import org.example.model.SwipeDirection;
import org.example.model.UserAccount;
import org.example.repository.MatchRepository;
import org.example.repository.SwipeRepository;
import org.example.repository.UserAccountRepository;
import org.example.repository.ProfileRepository;
import org.example.repository.ProfilePhotoRepository;
import org.example.model.Profile;
import org.example.model.ProfilePhoto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SwipeService {

    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final UserAccountRepository userAccountRepository;
    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository profilePhotoRepository;

    public SwipeService(SwipeRepository swipeRepository,
                        MatchRepository matchRepository,
                        UserAccountRepository userAccountRepository,
                        ProfileRepository profileRepository,
                        ProfilePhotoRepository profilePhotoRepository) {
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.userAccountRepository = userAccountRepository;
        this.profileRepository = profileRepository;
        this.profilePhotoRepository = profilePhotoRepository;
    }

    @Transactional
    public MatchResponse swipe(Long fromUserId, SwipeRequest request) {
        if (fromUserId.equals(request.targetUserId())) {
            throw new BadRequestException("Cannot swipe yourself");
        }

        UserAccount fromUser = userAccountRepository.findById(fromUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + fromUserId));
        UserAccount toUser = userAccountRepository.findById(request.targetUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + request.targetUserId()));

        SwipeDirection direction = Boolean.TRUE.equals(request.like())
                ? SwipeDirection.LIKE
                : SwipeDirection.DISLIKE;

        Swipe swipe = swipeRepository.findByFromUserAndToUser(fromUser, toUser)
                .orElseGet(Swipe::new);
        swipe.setFromUser(fromUser);
        swipe.setToUser(toUser);
        swipe.setDirection(direction);
        swipeRepository.save(swipe);

        if (direction == SwipeDirection.LIKE) {
            return checkAndCreateMatch(fromUser, toUser);
        }
        return null;
    }

    private MatchResponse checkAndCreateMatch(UserAccount user1, UserAccount user2) {
        boolean mutual = swipeRepository.findByFromUserAndToUser(user2, user1)
                .filter(sw -> sw.getDirection() == SwipeDirection.LIKE)
                .isPresent();

        if (!mutual) {
            return null;
        }

        Long lowId = Math.min(user1.getId(), user2.getId());
        Long highId = Math.max(user1.getId(), user2.getId());

        UserAccount u1 = user1.getId().equals(lowId) ? user1 : user2;
        UserAccount u2 = user1.getId().equals(lowId) ? user2 : user1;

        Match match = matchRepository.findByUser1AndUser2(u1, u2)
                .orElseGet(() -> {
                    Match m = new Match();
                    m.setUser1(u1);
                    m.setUser2(u2);
                    return matchRepository.save(m);
                });

        return buildMatchResponse(match, user1);
    }

    private MatchResponse buildMatchResponse(Match match, UserAccount currentUser) {
        UserAccount partner = match.getUser1().getId().equals(currentUser.getId()) ? match.getUser2() : match.getUser1();

        String partnerName = "Unknown";
        String partnerPhotoUrl = null;

        Profile profile = profileRepository.findByOwnerAndActiveTrue(partner)
                .stream().findFirst().orElse(null);

        if (profile != null) {
            partnerName = profile.getDisplayName();
            partnerPhotoUrl = profilePhotoRepository.findByProfile(profile).stream()
                    .findFirst()
                    .map(ProfilePhoto::getUrl)
                    .orElse(null);
        }

        return new MatchResponse(match.getId(), partner.getId(), partnerName, partnerPhotoUrl);
    }

    public MatchResponse getMatch(Long userId, Long matchId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found: " + matchId));

        if (!match.getUser1().getId().equals(user.getId()) && !match.getUser2().getId().equals(user.getId())) {
            throw new BadRequestException("User is not part of this match");
        }

        return buildMatchResponse(match, user);
    }

    public List<MatchResponse> getMyMatches(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        return matchRepository.findByUser1OrUser2(user, user)
                .stream()
                .map(m -> buildMatchResponse(m, user))
                .toList();
    }
}

