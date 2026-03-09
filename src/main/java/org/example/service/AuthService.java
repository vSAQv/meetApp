package org.example.service;

import org.example.dto.AuthDtos.AuthResponse;
import org.example.dto.AuthDtos.LoginRequest;
import org.example.dto.AuthDtos.RegisterRequest;
import org.example.exception.BadRequestException;
import org.example.model.Gender;
import org.example.model.UserAccount;
import org.example.repository.UserAccountRepository;
import org.example.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserAccountRepository userAccountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
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

        userAccountRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()
                )
        );
        String username = auth.getName();
        UserAccount user = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        return new AuthResponse(token);
    }
}

