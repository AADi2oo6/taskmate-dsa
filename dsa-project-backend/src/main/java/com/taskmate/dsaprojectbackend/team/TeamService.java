package com.taskmate.dsaprojectbackend.team;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmate.dsaprojectbackend.common.UnionFind;
import com.taskmate.dsaprojectbackend.person.Person;
import com.taskmate.dsaprojectbackend.person.PersonRepository;

import jakarta.annotation.PostConstruct;

@Service
public class TeamService {
    private final TeamRepository teamRepository;
    private final PersonRepository personRepository;
    private final String CSV_FILE_PATH = Paths.get("teams_data.csv").toAbsolutePath().toString();
    private UnionFind personTeamUnionFind;

    public TeamService(TeamRepository teamRepository, PersonRepository personRepository) {
        this.teamRepository = teamRepository;
        this.personRepository = personRepository;
        this.personTeamUnionFind = new UnionFind();
    }

    @PostConstruct
    public void init() {
        // This was missing. We need to load the teams from the CSV on startup.
        // loadTeamsFromCSV(); // This method needs to be implemented to read from teams_data.csv
        // After loading, rebuild the UnionFind structure.
        // rebuildUnionFind();
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(int id) {
        return teamRepository.findById(id).orElse(null);
    }

    @Transactional
    public Team createTeam(com.taskmate.dsaprojectbackend.team.CreateTeamRequest request) {
        Team newTeam = new Team();
        newTeam.setName(request.getTeamName());
        newTeam.setLeadId(request.getLeadId());

        // Parse the delimited string of member IDs
        List<Integer> memberIds = new ArrayList<>();
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            memberIds = Stream.of(request.getMemberIds().split(";"))
                              .map(Integer::parseInt)
                              .collect(Collectors.toList());
        }

        List<Person> members = personRepository.findAllById(memberIds);
        Set<Person> memberSet = new HashSet<>(members);
        newTeam.setMembers(memberSet);

        // Since Person is the owning side, we must update it too
        for (Person person : memberSet) {
            person.getTeams().add(newTeam);
            personRepository.save(person); // Explicitly save the owning side of the relationship
        }

        Team savedTeam = teamRepository.save(newTeam);

        // Now, update the in-memory Union-Find structure
        if (memberIds.size() > 1) {
            int firstPersonId = memberIds.get(0);
            for (int i = 1; i < memberIds.size(); i++) {
                personTeamUnionFind.union(firstPersonId, memberIds.get(i));
            }
        }

        saveTeamsToCSV(); // Save the new state to the CSV file.

        return savedTeam;
    }

    @Transactional
    public Team updateTeam(int id, com.taskmate.dsaprojectbackend.team.CreateTeamRequest request) {
        return teamRepository.findById(id).map(existingTeam -> {
            // Update the team's name
            existingTeam.setName(request.getTeamName());
            existingTeam.setLeadId(request.getLeadId());

            // Disassociate old members
            // Create a copy to iterate over to avoid ConcurrentModificationException
            for (Person oldMember : new HashSet<>(existingTeam.getMembers())) {
                oldMember.getTeams().remove(existingTeam);
                personRepository.save(oldMember); // Save the change on the owning side
            }
            existingTeam.getMembers().clear();

            // Associate new members
            List<Integer> memberIds = new ArrayList<>();
            if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
                memberIds = Stream.of(request.getMemberIds().split(";"))
                                  .map(Integer::parseInt)
                                  .collect(Collectors.toList());
            }

            List<Person> newMembers = personRepository.findAllById(memberIds);
            for (Person newMember : newMembers) {
                newMember.getTeams().add(existingTeam);
                existingTeam.getMembers().add(newMember);
                personRepository.save(newMember); // Save the change on the owning side
            }

            // Save the updated team first.
            Team savedTeam = teamRepository.save(existingTeam);
            saveTeamsToCSV(); // Save the updated state to the CSV file.
            // Then, reload it from the database to ensure all associations are fresh before returning.
            return teamRepository.findById(id).orElse(existingTeam);
        }).orElse(null); // Or throw an exception if team not found
    }

    @Transactional
    public boolean deleteTeam(int id) {
        return teamRepository.findById(id).map(team -> {
            // Before deleting the team, we must remove it from all associated people.
            // Create a copy of the members set to iterate over, to avoid ConcurrentModificationException.
            // This is the owning side of the relationship, so changes here will be persisted.
            for (Person person : new HashSet<>(team.getMembers())) {
                person.getTeams().remove(team);
            }

            // Clear the members from the team side as well to be safe
            team.getMembers().clear();
            teamRepository.delete(team);
            saveTeamsToCSV(); // Save the updated state to the CSV file.
            return true;
        }).orElse(false);
    }

    public long getTeamCount() {
        return teamRepository.count();
    }

    /**
     * Checks if two people are on the same team using the Union-Find data structure.
     * This operation is extremely fast (nearly O(1)).
     */
    public boolean areOnSameTeam(int personId1, int personId2) {
        return personTeamUnionFind.find(personId1) == personTeamUnionFind.find(personId2);
    }

    @Transactional(readOnly = true) // This ensures the session is open to fetch lazy-loaded members.
    public void saveTeamsToCSV() {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(CSV_FILE_PATH))) {
            bw.write("team_id,team_name,lead_id,member_ids");
            bw.newLine();
            List<Team> allTeams = teamRepository.findAll();
            for (Team team : allTeams) {
                String memberIds = team.getMembers().stream()
                                       .map(p -> String.valueOf(p.getId()))
                                       .collect(Collectors.joining(";"));
                
                bw.write(String.join(",",
                        String.valueOf(team.getId()),
                        team.getName(),
                        team.getLeadId() == null ? "" : String.valueOf(team.getLeadId()),
                        memberIds));
                bw.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}