package lk.visionroot.assignment.repository;

import lk.visionroot.assignment.entity.ServiceRequest;
import lk.visionroot.assignment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    // Basic find users
    List<ServiceRequest> findByUserOrderByCreatedAtDesc(User user);
}