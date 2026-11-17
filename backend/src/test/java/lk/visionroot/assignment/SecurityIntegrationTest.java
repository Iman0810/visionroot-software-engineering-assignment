package lk.visionroot.assignment;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.visionroot.assignment.dto.AuthenticationRequest;
import lk.visionroot.assignment.dto.RegisterRequest;
import lk.visionroot.assignment.entity.Role;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterNewUserAndForceUserRole() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.email").value("john@test.com"));

        User savedUser = userRepository.findByEmail("john@test.com").orElseThrow();
        assertEquals(Role.USER, savedUser.getRole());
    }

    @Test
    void shouldLoginWithValidCredentials() throws Exception {
        User user = User.builder()
                .name("Test Login")
                .email("login@test.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .build();
        userRepository.save(user);

        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("login@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void shouldReturnUnauthorizedForInvalidPassword() throws Exception {
        User user = User.builder()
                .name("Test Login")
                .email("login@test.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .build();
        userRepository.save(user);

        AuthenticationRequest request = new AuthenticationRequest();
        request.setEmail("login@test.com");
        request.setPassword("WRONG_PASSWORD");

        mockMvc.perform(post("/api/auth/login")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturnForbiddenWhenAccessingAdminEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturnForbiddenForInvalidToken() throws Exception {
  
        mockMvc.perform(get("/api/requests")
                .header("Authorization", "Bearer invalid.fake.jwt"))
                .andExpect(status().isForbidden());
    }
}