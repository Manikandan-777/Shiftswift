package com.example.demo.controller;

import com.example.demo.model.LeaveRequest;
import com.example.demo.model.LeaveStatus;
import com.example.demo.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    public ResponseEntity<LeaveRequest> create(@RequestParam Long userId, @RequestBody LeaveRequest leaveRequest) {
        return ResponseEntity.ok(leaveRequestService.create(userId, leaveRequest));
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> findAll() {
        return ResponseEntity.ok(leaveRequestService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> update(@PathVariable Long id, @RequestParam LeaveStatus status) {
        return ResponseEntity.ok(leaveRequestService.update(id, status));
    }
}
