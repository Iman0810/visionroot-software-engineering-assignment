package lk.visionroot.assignment;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.visionroot.assignment.dto.CreateServiceRequestDto;
import lk.visionroot.assignment.entity.Priority;
import lk.visionroot.assignment.entity.Role;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.ServiceRequestRepository;
import lk.visionroot.assignment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ServiceRequestIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRequestRepository requestRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        requestRepository.deleteAll(); 
        userRepository.deleteAll(); 
        
        User testUser = User.builder()
                .name("Test User")
                .email("user@test.com")
                .password("password")
                .role(Role.USER)
                .build();
        userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void shouldCreateRequestSuccessfully() throws Exception {
        CreateServiceRequestDto dto = new CreateServiceRequestDto();
        dto.setTitle("Integration Test Request");
        dto.setDescription("Testing the create endpoint");
        dto.setCategory("Technical");
        dto.setPriority(Priority.HIGH);

        mockMvc.perform(post("/api/requests")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration Test Request"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void shouldReturnBadRequestWhenTitleIsMissing() throws Exception {
        CreateServiceRequestDto dto = new CreateServiceRequestDto();
        dto.setDescription("Missing title test");
        dto.setCategory("Technical");
        dto.setPriority(Priority.LOW);

        mockMvc.perform(post("/api/requests")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void shouldReturnNotFoundForMissingRequest() throws Exception {
        org.junit.jupiter.api.Assertions.assertThrows(
            jakarta.servlet.ServletException.class, 
            () -> {
                mockMvc.perform(get("/api/requests/9999"));
            }
        );
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void shouldReturnForbiddenWhenAccessingAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }
}