package org.example.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        OffsetDateTime timestamp,
        List<String> details
) {

    public static ErrorResponse of(
            int status,
            String error,
            String message,
            String path
    ) {
        return new ErrorResponse(status, error, message, path, OffsetDateTime.now(), null);
    }

    public static ErrorResponse withDetails(
            int status,
            String error,
            String message,
            String path,
            List<String> details
    ) {
        return new ErrorResponse(status, error, message, path, OffsetDateTime.now(), details);
    }
}

