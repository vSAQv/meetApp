package org.example.rate;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /**
     * Максимальное количество запросов.
     */
    int limit();

    /**
     * Интервал в секундах.
     */
    int windowSeconds();
}

