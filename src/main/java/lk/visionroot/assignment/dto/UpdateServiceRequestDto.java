package lk.visionroot.assignment.dto;

import lk.visionroot.assignment.entity.Priority;
import lombok.Data;

@Data
public class UpdateServiceRequestDto {
    private String title;
    private String description;
    private String category;
    private Priority priority;
}