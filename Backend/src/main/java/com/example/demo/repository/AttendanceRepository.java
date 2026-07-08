package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
}
