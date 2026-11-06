package lk.visionroot.assignment.service;

import lk.visionroot.assignment.dto.CreateServiceRequestDto;
import lk.visionroot.assignment.dto.ServiceRequestDto;
import lk.visionroot.assignment.entity.ServiceRequest;
import lk.visionroot.assignment.entity.Status;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.exception.BadRequestException;
import lk.visionroot.assignment.repository.ServiceRequestRepository;
import lk.visionroot.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;

    // Helper to get the currently logged-in user
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    // Helper to map Entity to DTO
    private ServiceRequestDto mapToDto(ServiceRequest request) {
        return ServiceRequestDto.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus())
                .userEmail(request.getUser().getEmail())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    public ServiceRequestDto createRequest(CreateServiceRequestDto dto) {
        User currentUser = getCurrentUser();
        
        ServiceRequest request = ServiceRequest.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(Status.PENDING) // starts as pending
                .user(currentUser)
                .build();
                
        return mapToDto(requestRepository.save(request));
    }

    public List<ServiceRequestDto> getMyRequests() {
        User currentUser = getCurrentUser();
        return requestRepository.findByUserOrderByCreatedAtDesc(currentUser)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ServiceRequestDto updateStatus(Long requestId, Status newStatus) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Request not found"));

        Status currentStatus = request.getStatus();

        //  business rules
        if (currentStatus == Status.RESOLVED || currentStatus == Status.CANCELLED) {
            throw new BadRequestException("Cannot update a request that is already RESOLVED or CANCELLED");
        }
        
        if (currentStatus == Status.PENDING && newStatus == Status.RESOLVED) {
            throw new BadRequestException("Request must be IN_PROGRESS before it can be RESOLVED");
        }

        if (newStatus == Status.PENDING) {
            throw new BadRequestException("Cannot revert a request to PENDING");
        }

        request.setStatus(newStatus);
        return mapToDto(requestRepository.save(request));
    }

    public ServiceRequestDto cancelRequest(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Request not found"));

        // User can only cancel their own request 
        User currentUser = getCurrentUser();
        if (!request.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("You can only cancel your own requests");
        }

        if (request.getStatus() != Status.PENDING && request.getStatus() != Status.IN_PROGRESS) {
            throw new BadRequestException("Only PENDING or IN_PROGRESS requests can be cancelled");
        }

        request.setStatus(Status.CANCELLED);
        return mapToDto(requestRepository.save(request));
    }
    
    public List<ServiceRequestDto> getAllRequestsAdmin() {
        return requestRepository.findAll()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

        public ServiceRequestDto updateRequest(Long id, CreateServiceRequestDto dto) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Request not found"));

        // Rule: A user may edit a request only while it is PENDING.
        if (request.getStatus() != Status.PENDING) {
            throw new BadRequestException("You can only edit requests that are PENDING");
        }

        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(dto.getCategory());
        request.setPriority(dto.getPriority());

        return mapToDto(requestRepository.save(request));
    }
}