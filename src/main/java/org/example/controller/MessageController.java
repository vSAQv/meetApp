package org.example.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.example.dto.MessageDtos.MessageResponse;
import org.example.dto.MessageDtos.SendMessageRequest;
import org.example.exception.EntityNotFoundException;
import org.example.model.UserAccount;
import org.example.rate.RateLimit;
import org.example.repository.UserAccountRepository;
import org.example.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Message", description = "Сообщения внутри матчей")
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserAccountRepository userAccountRepository;

    public MessageController(MessageService messageService,
                             UserAccountRepository userAccountRepository) {
        this.messageService = messageService;
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
    @RateLimit(limit = 30, windowSeconds = 60) // до 30 сообщений в минуту
    public ResponseEntity<MessageResponse> send(
            Principal principal,
            @RequestBody @Valid SendMessageRequest request
    ) {
        Long userId = currentUserId(principal);
        MessageResponse response = messageService.sendMessage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{matchId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            Principal principal,
            @PathVariable Long matchId
    ) {
        Long userId = currentUserId(principal);
        List<MessageResponse> list = messageService.getMessages(userId, matchId);
        return ResponseEntity.ok(list);
    }
}

