package lk.visionroot.assignment.service;

import lk.visionroot.assignment.config.JwtService;
import lk.visionroot.assignment.dto.AuthenticationRequest;
import lk.visionroot.assignment.dto.AuthenticationResponse;
import lk.visionroot.assignment.dto.RegisterRequest;
import lk.visionroot.assignment.entity.User;
import lk.visionroot.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        // Check if user already exists
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        var user = User.builder()
                .name(request.getName() != null ? request.getName() : "Unknown User") // Handle null for old registrations
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(lk.visionroot.assignment.entity.Role.USER)
                .build();;
                
        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .email(user.getEmail())
                .name(user.getName()) // Send name back to frontend
                .build();
    }

       public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Authenticate using the provided email/name
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), // Frontend will send email OR name here
                        request.getPassword()
                )
        );
        
        // Find the user to generate the token
        var user = repository.findByEmail(request.getEmail())
                .or(() -> repository.findByName(request.getEmail()))
                .orElseThrow(); 
                
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .email(user.getEmail())
                .name(user.getName()) // Send name back to frontend
                .build();
    }
}