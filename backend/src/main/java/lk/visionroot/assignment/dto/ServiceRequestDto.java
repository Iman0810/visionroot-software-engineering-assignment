package lk.visionroot.assignment.dto;

import lk.visionroot.assignment.entity.Priority;
import lk.visionroot.assignment.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceRequestDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private Status status;
    private String userEmail;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}