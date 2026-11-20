package lk.visionroot.assignment;

import jakarta.servlet.http.Cookie;
import lk.visionroot.assignment.entity.Role;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class AuthenticationLifecycleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User testUser = User.builder()
                .name("Lifecycle User")
                .email("lifecycle@test.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .build();
        userRepository.save(testUser);
    }
        @Test
    @WithMockUser(username = "lifecycle@test.com", roles = "USER")
    void fullAuthenticationLifecycle() throws Exception {
        // verify we can access a protected endpoint as a logged-in user
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isOk());

        // logout should succeed and clear the cookie
        MvcResult logoutResult = mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie clearedCookie = logoutResult.getResponse().getCookie("jwt");
        assertNotNull(clearedCookie, "Logout should send a cleared cookie");
        assertEquals(0, clearedCookie.getMaxAge(), "Logout cookie should have maxAge 0");
    }
}