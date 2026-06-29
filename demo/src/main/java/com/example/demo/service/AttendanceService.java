package com.example.demo.service;

import com.example.demo.model.Attendance;
import com.example.demo.model.User;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public Attendance checkIn(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Attendance attendance = Attendance.builder()
                .user(user)
                .checkIn(LocalDateTime.now())
                .build();
        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId).orElseThrow(() -> new RuntimeException("Attendance not found"));
        attendance.setCheckOut(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> findAll() {
        return attendanceRepository.findAll();
    }
}
