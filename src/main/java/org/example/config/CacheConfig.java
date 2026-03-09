package org.example.config;

import java.util.List;
import org.example.dto.ProfileDtos.ProfileResponse;
import org.springframework.stereotype.Component;

@Component
public class CacheConfig {

    private static final int MAX_PROFILES_CACHE_SIZE = 100;

    private static final String RECOMMENDED_PROFILES_KEY = "recommendedProfiles";

    private final LruCache<String, List<ProfileResponse>> profilesCache =
            new LruCache<>(MAX_PROFILES_CACHE_SIZE);

    public List<ProfileResponse> getRecommendedProfiles() {
        return profilesCache.get(RECOMMENDED_PROFILES_KEY);
    }

    public void putRecommendedProfiles(List<ProfileResponse> profiles) {
        profilesCache.put(RECOMMENDED_PROFILES_KEY, profiles);
    }

    public void evictRecommendedProfiles() {
        profilesCache.remove(RECOMMENDED_PROFILES_KEY);
    }
}

