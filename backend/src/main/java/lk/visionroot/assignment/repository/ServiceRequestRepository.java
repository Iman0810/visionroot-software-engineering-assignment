package lk.visionroot.assignment.repository;

import lk.visionroot.assignment.entity.ServiceRequest;
import lk.visionroot.assignment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long>, JpaSpecificationExecutor<ServiceRequest> {
    List<ServiceRequest> findByUserOrderByCreatedAtDesc(User user);
}