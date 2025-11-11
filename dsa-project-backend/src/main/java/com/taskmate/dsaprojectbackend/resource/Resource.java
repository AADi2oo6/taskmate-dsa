package com.taskmate.dsaprojectbackend.resource;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.taskmate.dsaprojectbackend.allocation.Allocation;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.List;
@Entity
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("resource")
    private List<Allocation> allocations;


    // Constructors
    // No-argument constructor for JPA/Jackson
    public Resource() {
    }

    public Resource(String name) {
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
}