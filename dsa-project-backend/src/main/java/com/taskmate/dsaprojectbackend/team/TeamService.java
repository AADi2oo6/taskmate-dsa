package com.taskmate.dsaprojectbackend.team;

// ... (keep all your existing imports) ...
import com.taskmate.dsaprojectbackend.common.UnionFind;
import com.taskmate.dsaprojectbackend.person.Person;
import com.taskmate.dsaprojectbackend.person.PersonRepository;
import jakarta.annotation.PostConstruct; // Make sure this is imported
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TeamService {
    private final TeamRepository teamRepository;
    private final PersonRepository personRepository;
    private UnionFind personTeamUnionFind;

    public TeamService(TeamRepository teamRepository, PersonRepository personRepository) {
        this.teamRepository = teamRepository;
        this.personRepository = personRepository;
        // Initialize UnionFind here
        this.personTeamUnionFind = new UnionFind();
    }

    @PostConstruct
    @Transactional(readOnly = true)
    public void init() {
        // This method runs on startup
        // We rebuild the UnionFind structure from database data
        System.out.println("Rebuilding UnionFind from database...");
        List<Team> allTeams = teamRepository.findAllWithMembers();
        for (Team team : allTeams) {
            List<Integer> memberIds = team.getMembers().stream()
                    .map(Person::getId)
                    .collect(Collectors.toList());

            if (memberIds.size() > 1) {
                int firstPersonId = memberIds.get(0);
                for (int i = 1; i < memberIds.size(); i++) {
                    personTeamUnionFind.union(firstPersonId, memberIds.get(i));
                }
            }
        }
        System.out.println("UnionFind rebuild complete.");
    }

    // ... (keep getAllTeams() and getTeamById() as they are) ...
    @Transactional(readOnly = true)
    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(TeamDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeamById(int id) {
        return teamRepository.findById(id)
                .map(TeamDTO::new)
                .orElse(null);
    }


    @Transactional
    public TeamDTO createTeam(CreateTeamRequest request) {
        Team newTeam = new Team();
        newTeam.setName(request.getTeamName());
        newTeam.setLeadId(request.getLeadId());

        List<Integer> memberIds = new ArrayList<>();
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            memberIds = Stream.of(request.getMemberIds().split(";"))
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        }

        // This will now find people FROM THE DATABASE
        List<Person> members = personRepository.findAllById(memberIds);
        Set<Person> memberSet = new HashSet<>(members);
        newTeam.setMembers(memberSet);

        // This loop now correctly associates the database person with the new team
        for (Person person : memberSet) {
            person.getTeams().add(newTeam);
            // No need to save person, @Transactional will handle it
        }

        Team savedTeam = teamRepository.save(newTeam);

        // Update UnionFind
        if (memberIds.size() > 1) {
            int firstPersonId = memberIds.get(0);
            for (int i = 1; i < memberIds.size(); i++) {
                personTeamUnionFind.union(firstPersonId, memberIds.get(i));
            }
        }

        // **THE FIX:**
        // We must re-fetch to let JPA populate the members list
        // on the inverse side for the DTO.
        return teamRepository.findById(savedTeam.getId())
                .map(TeamDTO::new)
                .orElse(null);
    }

    @Transactional
    public TeamDTO updateTeam(int id, CreateTeamRequest request) {
        return teamRepository.findById(id).map(existingTeam -> {
            existingTeam.setName(request.getTeamName());
            existingTeam.setLeadId(request.getLeadId());

            // Remove old members
            for (Person oldMember : new HashSet<>(existingTeam.getMembers())) {
                oldMember.getTeams().remove(existingTeam);
            }
            existingTeam.getMembers().clear();

            // Add new members
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
            }

            // Re-initialize and rebuild UnionFind for this team
            if (memberIds.size() > 1) {
                int firstPersonId = memberIds.get(0);
                for (int i = 1; i < memberIds.size(); i++) {
                    personTeamUnionFind.union(firstPersonId, memberIds.get(i));
                }
            }

            // `existingTeam` is managed, so changes will be saved
            // at the end of the transaction. We re-fetch for the DTO.
            return teamRepository.findById(id)
                    .map(TeamDTO::new)
                    .orElse(null);
        }).orElse(null);
    }

    @Transactional
    public boolean deleteTeam(int id) {
        return teamRepository.findById(id).map(team -> {
            for (Person person : new HashSet<>(team.getMembers())) {
                person.getTeams().remove(team);
            }
            team.getMembers().clear();
            teamRepository.delete(team);
            return true;
        }).orElse(false);
    }

    public long getTeamCount() {
        return teamRepository.count();
    }

    public boolean areOnSameTeam(int personId1, int personId2) {
        return personTeamUnionFind.find(personId1) == personTeamUnionFind.find(personId2);
    }

    // REMOVED saveTeamsToCSV() method. It's not needed if we use the DB.
}