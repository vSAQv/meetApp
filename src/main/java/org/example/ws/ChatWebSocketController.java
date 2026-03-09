package org.example.ws;

import java.security.Principal;
import org.example.dto.MessageDtos.MessageResponse;
import org.example.dto.MessageDtos.SendMessageRequest;
import org.example.exception.EntityNotFoundException;
import org.example.model.UserAccount;
import org.example.repository.UserAccountRepository;
import org.example.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final MessageService messageService;
    private final UserAccountRepository userAccountRepository;

    public ChatWebSocketController(MessageService messageService,
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

    @MessageMapping("/chat/{matchId}")
    @SendTo("/topic/chat.{matchId}")
    public MessageResponse sendChatMessage(
            Principal principal,
            @DestinationVariable Long matchId,
            @Payload String content
    ) {
        Long userId = currentUserId(principal);
        SendMessageRequest request = new SendMessageRequest(matchId, content);
        return messageService.sendMessage(userId, request);
    }
}

