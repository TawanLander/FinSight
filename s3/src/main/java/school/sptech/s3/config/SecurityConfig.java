package school.sptech.s3.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;
import org.springframework.web.util.WebUtils;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests.anyRequest().authenticated())
                .oauth2ResourceServer(resource -> resource
                        .bearerTokenResolver(request -> {
                            String token = request.getHeader("access_token");
                            if (!StringUtils.hasText(token)) {
                                var cookie = WebUtils.getCookie(request, "access_token");
                                token = cookie == null ? null : cookie.getValue();
                            }
                            return StringUtils.hasText(token) ? token : null;
                        })
                        .jwt(jwt -> jwt.decoder(jwtDecoder).jwtAuthenticationConverter(SecurityConfig::authenticate)))
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${JWT_SECRET}") String jwtSecret) {
        byte[] secret = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (jwtSecret.isBlank() || secret.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must have at least 32 bytes for HS256");
        }

        var key = new SecretKeySpec(secret, "HmacSHA256");
        var decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(new JwtTimestampValidator(Duration.ZERO));
        return decoder;
    }

    private static UsernamePasswordAuthenticationToken authenticate(Jwt jwt) {
        if (jwt.getExpiresAt() == null) {
            throw new InvalidBearerTokenException("Missing access token expiration");
        }

        Object id = jwt.getClaims().get("id");
        if (id instanceof Integer userId) {
            return UsernamePasswordAuthenticationToken.authenticated(userId, null, List.of());
        }
        if (id instanceof Long userId && userId >= Integer.MIN_VALUE && userId <= Integer.MAX_VALUE) {
            return UsernamePasswordAuthenticationToken.authenticated(userId.intValue(), null, List.of());
        }
        throw new InvalidBearerTokenException("Invalid access token user ID");
    }
}
