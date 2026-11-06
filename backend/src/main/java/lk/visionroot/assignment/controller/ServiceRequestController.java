package lk.visionroot.assignment.controller;

import lk.visionroot.assignment.dto.CreateServiceRequestDto;
import lk.visionroot.assignment.dto.ServiceRequestDto;
import lk.visionroot.assignment.dto.UpdateServiceRequestDto;
import lk.visionroot.assignment.dto.UpdateStatusDto;
import lk.visionroot.assignment.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService service;

    //user endpoints

    @PostMapping
    public ResponseEntity<ServiceRequestDto> createRequest(@Valid @RequestBody CreateServiceRequestDto dto) {
        return ResponseEntity.ok(service.createRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDto>> getMyRequests() {
        return ResponseEntity.ok(service.getMyRequests());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ServiceRequestDto> cancelRequest(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelRequest(id));
    }
    

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceRequestDto>> getAllRequestsAdmin() {
        return ResponseEntity.ok(service.getAllRequestsAdmin());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceRequestDto> updateStatus(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateStatusDto dto
    ) {
        return ResponseEntity.ok(service.updateStatus(id, dto.getStatus()));
    }
}