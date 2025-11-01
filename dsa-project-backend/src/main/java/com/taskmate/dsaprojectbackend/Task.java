// src/main/java/com/taskmate/dsaprojectbackend/Task.java
package com.taskmate.dsaprojectbackend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String description;
    private String status;
    private String date; // Changed to String
    private String targetRole;
    private Integer assignedPersonId; // New field to track assignment

    // No-argument constructor for Spring/Jackson deserialization
    public Task() {}

    public Task(String description, String status, String date, String targetRole) {
        this.description = description;
        this.status = status;
        this.date = date;
        this.targetRole = targetRole;
        this.assignedPersonId = null; // Not assigned by default
    }

    // New getters and setters for the new fields
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public Integer getAssignedPersonId() {
        return assignedPersonId;
    }

    public void setAssignedPersonId(Integer assignedPersonId) {
        this.assignedPersonId = assignedPersonId;
    }
    
    // Existing getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}