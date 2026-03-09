package org.example.service;

import java.util.List;
import org.example.dto.MessageDtos.MessageResponse;
import org.example.dto.MessageDtos.SendMessageRequest;
import org.example.exception.BadRequestException;
import org.example.exception.EntityNotFoundException;
import org.example.model.Match;
import org.example.model.Message;
import org.example.model.UserAccount;
import org.example.repository.MatchRepository;
import org.example.repository.MessageRepository;
import org.example.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MatchRepository matchRepository;
    private final MessageRepository messageRepository;
    private final UserAccountRepository userAccountRepository;

    public MessageService(MatchRepository matchRepository,
                          MessageRepository messageRepository,
                          UserAccountRepository userAccountRepository) {
        this.matchRepository = matchRepository;
        this.messageRepository = messageRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        UserAccount sender = userAccountRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + senderId));
        Match match = matchRepository.findById(request.matchId())
                .orElseThrow(() -> new EntityNotFoundException("Match not found: " + request.matchId()));

        if (!match.getUser1().getId().equals(sender.getId())
                && !match.getUser2().getId().equals(sender.getId())) {
            throw new BadRequestException("User is not part of this match");
        }

        Message message = new Message();
        message.setMatch(match);
        message.setSender(sender);
        message.setContent(request.content());
        Message saved = messageRepository.save(message);

        return toResponse(saved);
    }

    public List<MessageResponse> getMessages(Long userId, Long matchId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found: " + matchId));

        if (!match.getUser1().getId().equals(user.getId())
                && !match.getUser2().getId().equals(user.getId())) {
            throw new BadRequestException("User is not part of this match");
        }

        return messageRepository.findByMatchOrderByCreatedAtAsc(match)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getMatch().getId(),
                message.getSender().getId(),
                message.getContent(),
                message.getCreatedAt(),
                message.getReadAt()
        );
    }
}

