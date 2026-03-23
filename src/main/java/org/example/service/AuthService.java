package org.example.service;

import org.example.dto.AuthDtos.AuthResponse;
import org.example.dto.AuthDtos.PasswordResetResponse;
import org.example.dto.AuthDtos.LoginRequest;
import org.example.dto.AuthDtos.ResetPasswordRequest;
import org.example.dto.AuthDtos.RegisterRequest;
import org.example.dto.AuthDtos.RequestPasswordResetRequest;
import org.example.dto.AuthDtos.VerifyEmailRequest;
import org.example.exception.BadRequestException;
import org.example.model.EmailVerificationToken;
import org.example.model.Gender;
import org.example.model.PasswordResetToken;
import org.example.model.Profile;
import org.example.model.UserAccount;
import org.example.repository.EmailVerificationTokenRepository;
import org.example.repository.PasswordResetTokenRepository;
import org.example.repository.ProfileRepository;
import org.example.repository.UserAccountRepository;
import org.example.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {

    // В проде сделай эти значения конфигурируемыми (application.yml).
    private static final long EMAIL_TOKEN_VALIDITY_SECONDS = 3600L * 24;
    private static final long PASSWORD_RESET_TOKEN_VALIDITY_SECONDS = 3600L;

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final ProfileRepository profileRepository;

    public AuthService(UserAccountRepository userAccountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       ProfileRepository profileRepository) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already taken");
        }
        if (userAccountRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }

        UserAccount user = new UserAccount();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDateOfBirth(request.dateOfBirth());
        user.setGender(Gender.valueOf(request.gender()));
        user.setLookingForGender(Gender.valueOf(request.lookingForGender()));
        user.getRoles().add("USER");
        user.setEnabled(false); // ждем email verification

        userAccountRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        String emailVerificationToken = createAndSaveEmailVerificationToken(user);
        return new AuthResponse(token, false, emailVerificationToken);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(), request.password()
                    )
            );
        } catch (Exception ex) {
            throw new BadRequestException("Invalid username or password");
        }

        String username = auth.getName();
        UserAccount user = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BadRequestException("Email is not verified");
        }

        ensureBasicProfile(user);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        return new AuthResponse(token, true, null);
    }

    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        String tokenHash = sha256Hex(request.token());
        EmailVerificationToken token = emailVerificationTokenRepository
                .findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        OffsetDateTime now = OffsetDateTime.now();
        if (token.getExpiresAt() == null || token.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        token.setUsedAt(now);
        emailVerificationTokenRepository.save(token);

        UserAccount user = token.getUser();
        user.setEnabled(true);
        userAccountRepository.save(user);

        ensureBasicProfile(user);

        String accessToken = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        return new AuthResponse(accessToken, true, null);
    }

    @Transactional
    public PasswordResetResponse requestPasswordReset(RequestPasswordResetRequest request) {
        UserAccount user = userAccountRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Email not registered"));

        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(sha256Hex(resetToken));
        token.setExpiresAt(OffsetDateTime.now().plusSeconds(PASSWORD_RESET_TOKEN_VALIDITY_SECONDS));

        passwordResetTokenRepository.save(token);

        // Для разработки отдаем токен прямо в ответе.
        // В проде вместо этого надо слать токен на email.
        return new PasswordResetResponse(resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = sha256Hex(request.token());
        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        OffsetDateTime now = OffsetDateTime.now();
        if (token.getExpiresAt() == null || token.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        UserAccount user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userAccountRepository.save(user);

        token.setUsedAt(now);
        passwordResetTokenRepository.save(token);
    }

    private String createAndSaveEmailVerificationToken(UserAccount user) {
        String tokenRaw = UUID.randomUUID().toString();

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setTokenHash(sha256Hex(tokenRaw));
        token.setExpiresAt(OffsetDateTime.now().plusSeconds(EMAIL_TOKEN_VALIDITY_SECONDS));

        emailVerificationTokenRepository.save(token);
        return tokenRaw;
    }

    private void ensureBasicProfile(UserAccount user) {
        if (profileRepository.existsByOwnerAndActiveTrue(user)) {
            return;
        }

        Profile profile = new Profile();
        profile.setOwner(user);
        profile.setDisplayName(user.getUsername());
        profile.setBio(null);
        profile.setCity(null);
        profile.setActive(true);
        profileRepository.save(profile);
    }

    private String sha256Hex(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}

