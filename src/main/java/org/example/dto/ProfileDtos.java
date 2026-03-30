package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfileDtos {

    private ProfileDtos() {
    }

    public record CreateOrUpdateProfileRequest(
            @NotBlank @Size(max = 100) String displayName,
            @Size(max = 500) String bio,
            @Size(max = 100) String city
    ) {
    }

    public record ProfileResponse(
            Long id,
            String displayName,
            String bio,
            String city,
            boolean active
    ) {
    }

    // Анкета-кандидат для свайпа (минимальный ответ под UI)
    public record CandidateProfileResponse(
            Long id,
            String displayName,
            String bio,
            String city,
            String photoUrl
    ) {
    }
}

