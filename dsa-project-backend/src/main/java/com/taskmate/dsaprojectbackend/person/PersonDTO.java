package com.taskmate.dsaprojectbackend.person;

import java.util.Set;
import java.util.stream.Collectors;

public class PersonDTO {
    private int id;
    private String name;
    private String role;
    private int totalWorkHour;
    private Integer managerId;
    private Set<TeamSummaryDTO> teams;

    // This DTO will represent a team with only its ID and name, breaking the circular reference.
    public static class TeamSummaryDTO {
        private int id;
        private String name;

        public TeamSummaryDTO(com.taskmate.dsaprojectbackend.team.Team team) {
            this.id = team.getId();
            this.name = team.getName();
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public PersonDTO(Person person) {
        this.id = person.getId();
        this.name = person.getName();
        this.role = person.getRole();
        this.totalWorkHour = person.getTotalWorkHour();
        this.managerId = person.getManagerId();
        this.teams = person.getTeams().stream()
                         .map(TeamSummaryDTO::new)
                         .collect(Collectors.toSet());
    }

    // Getters and Setters for PersonDTO
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public int getTotalWorkHour() { return totalWorkHour; }
    public void setTotalWorkHour(int totalWorkHour) { this.totalWorkHour = totalWorkHour; }
    public Integer getManagerId() { return managerId; }
    public void setManagerId(Integer managerId) { this.managerId = managerId; }
    public Set<TeamSummaryDTO> getTeams() { return teams; }
    public void setTeams(Set<TeamSummaryDTO> teams) { this.teams = teams; }
}