package com.example.demo.service;

import com.example.demo.model.Shift;
import com.example.demo.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {
    private final ShiftRepository shiftRepository;

    public List<Shift> findAll() {
        return shiftRepository.findAll();
    }

    public Shift create(Shift shift) {
        return shiftRepository.save(shift);
    }

    public Shift update(Long id, Shift shift) {
        Shift existing = shiftRepository.findById(id).orElseThrow(() -> new RuntimeException("Shift not found"));
        existing.setDate(shift.getDate());
        existing.setStartTime(shift.getStartTime());
        existing.setEndTime(shift.getEndTime());
        existing.setTitle(shift.getTitle());
        existing.setDepartment(shift.getDepartment());
        return shiftRepository.save(existing);
    }

    public void delete(Long id) {
        shiftRepository.deleteById(id);
    }
}
