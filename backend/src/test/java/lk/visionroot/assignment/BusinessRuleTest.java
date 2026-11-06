package lk.visionroot.assignment;

import lk.visionroot.assignment.entity.Priority;
import lk.visionroot.assignment.entity.ServiceRequest;
import lk.visionroot.assignment.entity.Status;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.ServiceRequestRepository;
import lk.visionroot.assignment.repository.UserRepository;
import lk.visionroot.assignment.service.ServiceRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BusinessRuleTest {

    @Mock
    private ServiceRequestRepository requestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ServiceRequestService service;

    private ServiceRequest pendingRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        mockUser = User.builder().email("test@test.com").role(lk.visionroot.assignment.entity.Role.USER).build();
        
        pendingRequest = ServiceRequest.builder()
                .id(1L)
                .status(Status.PENDING)
                .user(mockUser)
                .title("Test")
                .description("Test desc")
                .category("Technical")
                .priority(Priority.LOW)
                .build();

        // Mock Security Context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@test.com");
        SecurityContextHolder.setContext(securityContext);
        
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
    }

    @Test
    void testCannotResolvePendingRequest() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));

        // Attempting to change PENDING directly to RESOLVED should throw an exception
        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.updateStatus(1L, Status.RESOLVED);
        });

        assertEquals("Request must be IN_PROGRESS before it can be RESOLVED", exception.getMessage());
    }

    @Test
    void testCanMovePendingToInProgress() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));
        when(requestRepository.save(any(ServiceRequest.class))).thenReturn(pendingRequest);

        // PENDING -> IN_PROGRESS is valid
        service.updateStatus(1L, Status.IN_PROGRESS);
        
        assertEquals(Status.IN_PROGRESS, pendingRequest.getStatus());
        verify(requestRepository, times(1)).save(pendingRequest);
    }

    @Test
    void testCannotRevertToPending() {
        pendingRequest.setStatus(Status.IN_PROGRESS);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(pendingRequest));

        // IN_PROGRESS -> PENDING is invalid
        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.updateStatus(1L, Status.PENDING);
        });

        assertEquals("Cannot revert a request to PENDING", exception.getMessage());
    }
}