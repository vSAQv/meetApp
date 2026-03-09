package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public final class MessageDtos {

    private MessageDtos() {
    }

    public record SendMessageRequest(
            @NotNull Long matchId,
            @NotBlank String content
    ) {
    }

    public record MessageResponse(
            Long id,
            Long matchId,
            Long senderId,
            String content,
            OffsetDateTime createdAt,
            OffsetDateTime readAt
    ) {
    }
}

