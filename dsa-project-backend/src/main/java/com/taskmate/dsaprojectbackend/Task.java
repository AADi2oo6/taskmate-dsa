// src/main/java/com/taskmate/dsaprojectbackend/Task.java
package com.taskmate.dsaprojectbackend;

import java.util.concurrent.atomic.AtomicInteger;

public class Task {
    private static final AtomicInteger idCounter = new AtomicInteger(0);
    private int id;
    private String description;
    private String status;
    private String date; // Changed to String
    private String targetRole;

    public Task(String description, String status, String date, String targetRole) {
        this.id = idCounter.incrementAndGet();
        this.description = description;
        this.status = status;
        this.date = date;
        this.targetRole = targetRole;
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