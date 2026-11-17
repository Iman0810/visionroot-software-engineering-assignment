package lk.visionroot.assignment.controller;

import lk.visionroot.assignment.dto.AuthenticationRequest;
import lk.visionroot.assignment.dto.AuthenticationResponse;
import lk.visionroot.assignment.dto.RegisterRequest;
import lk.visionroot.assignment.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        // Get the response from the service
        AuthenticationResponse response = service.authenticate(request);
        
        // Create Http Only Cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                .httpOnly(true)  //prevent access from JavaScript
                .secure(true)   // Required for HTTPS
                .sameSite("None")      // Required for Cross-Origin 
                .path("/")             // Cookie is valid for all paths
                .maxAge(Duration.ofDays(1)) // Expires in 1 day
                .build();

        // Attach cookie to the response header AND return the JSON body
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0) // Expire immediately
                .build();
                
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }
}