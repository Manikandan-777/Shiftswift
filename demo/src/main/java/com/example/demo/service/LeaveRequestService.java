package com.example.demo.service;

import com.example.demo.model.LeaveRequest;
import com.example.demo.model.LeaveStatus;
import com.example.demo.model.User;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    public LeaveRequest create(Long userId, LeaveRequest leaveRequest) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> findAll() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest update(Long id, LeaveStatus status) {
        LeaveRequest request = leaveRequestRepository.findById(id).orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(status);
        return leaveRequestRepository.save(request);
    }
}
