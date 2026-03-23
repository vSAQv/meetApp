package org.example.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotNull LocalDate dateOfBirth,
            @NotBlank String gender,
            @NotBlank String lookingForGender
    ) {
    }

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }

    public record AuthResponse(
            String accessToken,
            boolean emailVerified,
            String emailVerificationToken
    ) {
    }

    public record VerifyEmailRequest(
            @NotBlank String token
    ) {
    }

    public record RequestPasswordResetRequest(
            @NotBlank @Email String email
    ) {
    }

    public record PasswordResetResponse(
            @NotBlank String resetToken
    ) {
    }

    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 6, max = 100) String newPassword
    ) {
    }
}

