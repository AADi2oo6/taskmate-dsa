package com.taskmate.dsaprojectbackend.person;

public class PersonRequest {
    private String name;
    private String role;
    private int totalWorkHour;
    private Integer managerId;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getTotalWorkHour() {
        return totalWorkHour;
    }

    public void setTotalWorkHour(int totalWorkHour) {
        this.totalWorkHour = totalWorkHour;
    }

    public Integer getManagerId() {
        return managerId;
    }

    public void setManagerId(Integer managerId) {
        this.managerId = managerId;
    }
}