package school.sptech.s3;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.util.Date;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"JWT_SECRET=" + S3ApplicationTests.TEST_SECRET, "S3_BUCKET=test-bucket"})
@Import(S3ApplicationTests.PrincipalController.class)
class S3ApplicationTests {
    static final String TEST_SECRET = "test-only-secret-with-at-least-32-bytes";

    @Test
    void authenticatesOnlyValidAccessTokens(@Autowired WebApplicationContext context) throws Exception {
        var mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        mvc.perform(get("/principal")).andExpect(status().isUnauthorized());
        mvc.perform(get("/principal").header("access_token", "invalid")).andExpect(status().isUnauthorized());
        mvc.perform(get("/principal").header("access_token", token(42, -60, TEST_SECRET)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/principal").header("access_token", token("42", 60, TEST_SECRET)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/principal").header("access_token", token(42, 60, TEST_SECRET + "-wrong")))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/principal").header("access_token", token(42, 60, TEST_SECRET)))
                .andExpect(status().isOk())
                .andExpect(content().string("42"));
        mvc.perform(get("/principal").cookie(new Cookie("access_token", token(42, 60, TEST_SECRET))))
                .andExpect(status().isOk())
                .andExpect(content().string("42"));
        mvc.perform(get("/principal").cookie(new Cookie("access_token", "invalid")))
                .andExpect(status().isUnauthorized());
    }

    private static String token(Object id, int lifetimeSeconds, String secret) throws Exception {
        var claims = new JWTClaimsSet.Builder()
                .claim("id", id)
                .expirationTime(Date.from(Instant.now().plusSeconds(lifetimeSeconds)))
                .build();
        var jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        jwt.sign(new MACSigner(secret));
        return jwt.serialize();
    }

    @RestController
    static class PrincipalController {
        @GetMapping("/principal")
        Integer principal(@AuthenticationPrincipal Integer userId) {
            return userId;
        }
    }

}
