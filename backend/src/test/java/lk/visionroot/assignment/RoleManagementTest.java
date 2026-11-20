package lk.visionroot.assignment;

import lk.visionroot.assignment.entity.Role;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoleManagementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        
        // create admin 
        User admin = User.builder()
                .name("Admin")
                .email("admin@test.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        // create normal user
        User user = User.builder()
                .name("Normal")
                .email("user@test.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.USER)
                .build();
        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminCanPromoteAndDemoteUser() throws Exception {
        User normalUser = userRepository.findByEmail("user@test.com").orElseThrow();

        // Promote
        mockMvc.perform(patch("/api/users/" + normalUser.getId() + "/role?role=ADMIN"))
                .andExpect(status().isOk());

        // Demote
        mockMvc.perform(patch("/api/users/" + normalUser.getId() + "/role?role=USER"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void normalUserCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }
}