package com.example.demo.config;

import com.example.demo.model.Department;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            Department dept = departmentRepository.save(Department.builder()
                    .name("Engineering")
                    .description("Core engineering team")
                    .build());

            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@shiftswift.local")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ROLE_ADMIN)
                        .department(dept)
                        .build());
            }
        }
    }
}
