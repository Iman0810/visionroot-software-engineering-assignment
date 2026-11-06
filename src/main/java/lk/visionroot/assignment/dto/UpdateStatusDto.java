package lk.visionroot.assignment.dto;

import lk.visionroot.assignment.entity.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusDto {
    @NotNull
    private Status status;
}