package com.taskmate.dsaprojectbackend.task;

public class TaskDTO {
    private String description;
    private String date;
    private String targetRole;
    private int priority = 3; // Default medium priority
    private String deadline;

    // Constructors
    public TaskDTO() {}

    public TaskDTO(String description, String date, String targetRole, int priority, String deadline) {
        this.description = description;
        this.date = date;
        this.targetRole = targetRole;
        this.priority = priority;
        this.deadline = deadline;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

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
}