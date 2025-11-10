package com.taskmate.dsaprojectbackend.team;

import com.taskmate.dsaprojectbackend.person.Person;
import java.util.Set;
import java.util.stream.Collectors;

public class TeamDTO {

    private int id;
    private String name;
    private Integer leadId;
    private int memberCount; // This is the field your React component wants
    private Set<PersonSummaryDTO> members; // This will hold a simple list of members

    // Inner class to hold minimal person data
    public static class PersonSummaryDTO {
        private int id;
        private String name;
        private String role;

        public PersonSummaryDTO(Person person) {
            this.id = person.getId();
            this.name = person.getName();
            this.role = person.getRole();
        }

        // Getters
        public int getId() { return id; }
        public String getName() { return name; }
        public String getRole() { return role; }

        // Setters
        public void setId(int id) { this.id = id; }
        public void setName(String name) { this.name = name; }
        public void setRole(String role) { this.role = role; }
    }

    // Constructor that builds the DTO from the Entity
    public TeamDTO(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        this.leadId = team.getLeadId();
        this.members = team.getMembers().stream()
                .map(PersonSummaryDTO::new)
                .collect(Collectors.toSet());
        this.memberCount = this.members.size(); // <-- This fixes the count!
    }

    // Getters and Setters for TeamDTO
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getLeadId() { return leadId; }
    public void setLeadId(Integer leadId) { this.leadId = leadId; }
    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }
    public Set<PersonSummaryDTO> getMembers() { return members; }
    public void setMembers(Set<PersonSummaryDTO> members) { this.members = members; }
}