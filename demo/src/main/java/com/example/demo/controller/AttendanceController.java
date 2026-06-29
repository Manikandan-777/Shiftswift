package com.example.demo.controller;

import com.example.demo.model.Attendance;
import com.example.demo.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/checkin")
    public ResponseEntity<Attendance> checkIn(@RequestParam Long userId) {
        return ResponseEntity.ok(attendanceService.checkIn(userId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Attendance> checkOut(@RequestParam Long attendanceId) {
        return ResponseEntity.ok(attendanceService.checkOut(attendanceId));
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> findAll() {
        return ResponseEntity.ok(attendanceService.findAll());
    }
}
