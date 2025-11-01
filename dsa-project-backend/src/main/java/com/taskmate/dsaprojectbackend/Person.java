package com.taskmate.dsaprojectbackend;

public class Person {
    private int id;
    private String name;
    private String role;
    private int totalWorkHour;

    // Constructor
    public Person(int id, String name,String role, int totalWorkHour) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.totalWorkHour = totalWorkHour;

    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

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
}