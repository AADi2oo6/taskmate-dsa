package com.taskmate.dsaprojectbackend;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import jakarta.annotation.PostConstruct; // Temporarily disable for stability

@Service
public class TeamService {
    private final TeamRepository teamRepository;
    private final PersonRepository personRepository;
    // private UnionFind personTeamUnionFind; // Temporarily disable for stability

    public TeamService(TeamRepository teamRepository, PersonRepository personRepository) {
        this.teamRepository = teamRepository;
        this.personRepository = personRepository;
        // this.personTeamUnionFind = new UnionFind();
    }

    // @PostConstruct // This method can cause startup issues with complex data loading.
    // public void init() {
    //     // Initialize the Union-Find structure with all people and existing teams
    //     List<Person> allPeople = personRepository.findAll();
    //     allPeople.forEach(person -> personTeamUnionFind.add(person.getId()));

    //     List<Team> allTeams = teamRepository.findAll();
    //     for (Team team : allTeams) {
    //         if (!team.getMembers().isEmpty()) {
    //             Person firstMember = team.getMembers().iterator().next();
    //             for (Person member : team.getMembers()) {
    //                 personTeamUnionFind.union(firstMember.getId(), member.getId());
    //             }
    //         }
    //     }
    // }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(int id) {
        return teamRepository.findById(id).orElse(null);
    }

    @Transactional
    public Team createTeam(CreateTeamRequest request) {
        Team newTeam = new Team();
        newTeam.setName(request.getTeamName());
        newTeam.setLeadId(request.getLeadId());

        List<Person> members = personRepository.findAllById(request.getMemberIds());
        Set<Person> memberSet = new HashSet<>(members);
        newTeam.setMembers(memberSet);

        // Since Person is the owning side, we must update it too
        for (Person person : memberSet) {
            person.getTeams().add(newTeam);
        }

        Team savedTeam = teamRepository.save(newTeam);

        // // Now, update the in-memory Union-Find structure
        // if (request.getMemberIds().size() > 1) {
        //     int firstPersonId = request.getMemberIds().get(0);
        //     for (int i = 1; i < request.getMemberIds().size(); i++) {
        //         personTeamUnionFind.union(firstPersonId, request.getMemberIds().get(i));
        //     }
        // }

        return savedTeam;
    }

    @Transactional
    public Team updateTeam(int id, CreateTeamRequest request) {
        return teamRepository.findById(id).map(existingTeam -> {
            // Update the team's name
            existingTeam.setName(request.getTeamName());
            existingTeam.setLeadId(request.getLeadId());

            // Disassociate old members
            // Create a copy to iterate over to avoid ConcurrentModificationException
            for (Person oldMember : new HashSet<>(existingTeam.getMembers())) {
                oldMember.getTeams().remove(existingTeam);
            }
            existingTeam.getMembers().clear();

            // Associate new members
            List<Person> newMembers = personRepository.findAllById(request.getMemberIds());
            for (Person newMember : newMembers) {
                newMember.getTeams().add(existingTeam);
                existingTeam.getMembers().add(newMember);
            }

            return teamRepository.save(existingTeam);
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
            return true;
        }).orElse(false);
    }

    public long getTeamCount() {
        return teamRepository.count();
    }

    // /**
    //  * Checks if two people are on the same team using the Union-Find data structure.
    //  * This operation is extremely fast (nearly O(1)).
    //  */
    // public boolean areOnSameTeam(int personId1, int personId2) {
    //     return personTeamUnionFind.find(personId1) == personTeamUnionFind.find(personId2);
    // }
}