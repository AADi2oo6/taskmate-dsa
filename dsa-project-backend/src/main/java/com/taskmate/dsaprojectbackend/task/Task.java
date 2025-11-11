// src/main/java/com/taskmate/dsaprojectbackend/task/Task.java
package com.taskmate.dsaprojectbackend.task;

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
    
    private Integer teamId; // New field to track team assignment
    // New fields for priority queue feature
    private int priority; // 1-5, where 1 is highest priority
    private String deadline; // Deadline date

    // No-argument constructor for Spring/Jackson deserialization
    public Task() {}

    // Constructor with all fields
    public Task(String description, String status, String date, String targetRole, int priority, String deadline) {
        this.description = description;
        this.status = status;
        this.date = date;
        this.targetRole = targetRole;
        this.assignedPersonId = null; // Not assigned by default
        this.priority = priority;
        this.deadline = deadline;
    }

    public Task(String description, String status, String date, String targetRole) {
        this.description = description;
        this.status = status;
        this.date = date;
        this.targetRole = targetRole;
        this.assignedPersonId = null; // Not assigned by default
        this.priority = 3; // Default medium priority
        this.deadline = date; // Default deadline to task date
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
    
    // Getters and setters for priority and deadline
    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
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

    public Integer getTeamId() {
        return teamId;
    }

    public void setTeamId(Integer teamId) {
        this.teamId = teamId;
    }
}