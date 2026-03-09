package org.example.rate;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.example.exception.BadRequestException;
import org.springframework.stereotype.Component;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class RateLimitAspect {

    private final Map<String, Deque<Long>> requests = new ConcurrentHashMap<>();

    @Around("@annotation(org.example.rate.RateLimit)")
    public Object rateLimit(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        RateLimit annotation = signature.getMethod().getAnnotation(RateLimit.class);
        int limit = annotation.limit();
        int windowSeconds = annotation.windowSeconds();

        HttpServletRequest request = currentRequest();
        String key = buildKey(request);

        long now = Instant.now().getEpochSecond();

        Deque<Long> deque = requests.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && now - deque.peekFirst() >= windowSeconds) {
                deque.pollFirst();
            }
            if (deque.size() >= limit) {
                throw new BadRequestException("Too many requests. Please try again later.");
            }
            deque.addLast(now);
        }

        return pjp.proceed();
    }

    private HttpServletRequest currentRequest() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new IllegalStateException("No request context");
        }
        return attrs.getRequest();
    }

    private String buildKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String path = request.getRequestURI();
        return ip + ":" + path;
    }
}

