package org.example.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.example.dto.SwipeDtos.MatchResponse;
import org.example.dto.SwipeDtos.SwipeRequest;
import org.example.exception.EntityNotFoundException;
import org.example.model.UserAccount;
import org.example.rate.RateLimit;
import org.example.repository.UserAccountRepository;
import org.example.service.SwipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Swipe", description = "Свайпы и матчи")
@RestController
@RequestMapping("/api/swipes")
public class SwipeController {

    private final SwipeService swipeService;
    private final UserAccountRepository userAccountRepository;

    public SwipeController(SwipeService swipeService,
                           UserAccountRepository userAccountRepository) {
        this.swipeService = swipeService;
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
    @RateLimit(limit = 60, windowSeconds = 60) // до 60 свайпов в минуту
    public ResponseEntity<MatchResponse> swipe(
            Principal principal,
            @RequestBody @Valid SwipeRequest request
    ) {
        Long userId = currentUserId(principal);
        MatchResponse match = swipeService.swipe(userId, request);
        if (match == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(match);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/matches")
    public ResponseEntity<List<MatchResponse>> myMatches(Principal principal) {
        Long userId = currentUserId(principal);
        List<MatchResponse> matches = swipeService.getMyMatches(userId);
        return ResponseEntity.ok(matches);
    }
}

