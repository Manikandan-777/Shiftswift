package com.example.demo.service;

import com.example.demo.model.Department;
import com.example.demo.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    public Department create(Department department) {
        return departmentRepository.save(department);
    }

    public Department update(Long id, Department department) {
        Department existing = departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
        existing.setName(department.getName());
        existing.setDescription(department.getDescription());
        return departmentRepository.save(existing);
    }

    public void delete(Long id) {
        departmentRepository.deleteById(id);
    }
}
