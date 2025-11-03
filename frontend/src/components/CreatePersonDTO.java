package com.example.dsaprojectbackend.dto;

public class CreatePersonDTO {
    private String name;
    private String role;
    private Integer totalWorkHour;

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

    public Integer getTotalWorkHour() {
        return totalWorkHour;
    }

    public void setTotalWorkHour(Integer totalWorkHour) {
        this.totalWorkHour = totalWorkHour;
    }
}