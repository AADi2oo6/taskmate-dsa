package com.taskmate.dsaprojectbackend.team;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.HashSet;
import com.taskmate.dsaprojectbackend.person.Person;

@Entity
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private Integer leadId; // New field to store the ID of the team lead

    @ManyToMany(mappedBy = "teams") // This is the inverse side
    @JsonManagedReference
    private Set<Person> members = new HashSet<>();

    public Team() {}

    public Team(String name) {
        this.name = name;
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

    public Set<Person> getMembers() {
        return members;
    }

    public void setMembers(Set<Person> members) {
        this.members = members;
    }

    public Integer getLeadId() {
        return leadId;
    }

    public void setLeadId(Integer leadId) {
        this.leadId = leadId;
    }
}