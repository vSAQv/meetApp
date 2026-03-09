package org.example.dto;

import jakarta.validation.constraints.NotNull;

public final class SwipeDtos {

    private SwipeDtos() {
    }

    public record SwipeRequest(
            @NotNull Long targetUserId,
            @NotNull Boolean like
    ) {
    }

    public record MatchResponse(
            Long id,
            Long user1Id,
            Long user2Id
    ) {
    }
}

