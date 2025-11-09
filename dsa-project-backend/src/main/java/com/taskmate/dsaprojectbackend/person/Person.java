package com.taskmate.dsaprojectbackend.person;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

@Entity
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String role;
    private int totalWorkHour;
    private Integer managerId; // New field for hierarchy

    @ManyToMany
    @JoinTable(
      name = "person_team", 
      joinColumns = @JoinColumn(name = "person_id"), 
      inverseJoinColumns = @JoinColumn(name = "team_id"))
    @JsonBackReference // This prevents the infinite loop
    private Set<com.taskmate.dsaprojectbackend.team.Team> teams = new HashSet<>(); // Initialize the set

    // No-argument constructor for Spring/Jackson deserialization
    public Person() {}

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

    public Integer getManagerId() {
        return managerId;
    }

    public void setManagerId(Integer managerId) {
        this.managerId = managerId;
    }

    public Set<com.taskmate.dsaprojectbackend.team.Team> getTeams() {
        return teams;
    }

    public void setTeams(Set<com.taskmate.dsaprojectbackend.team.Team> teams) {
        this.teams = teams;
    }
}