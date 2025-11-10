package com.taskmate.dsaprojectbackend.team;

import java.util.List;
import java.util.Map;
import com.taskmate.dsaprojectbackend.team.TeamDTO; // <-- Add this import
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @GetMapping
    public List<TeamDTO> getAllTeams() { // <-- Change return type
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable int id) { // <-- Change return type
        TeamDTO team = teamService.getTeamById(id);
        if (team != null) {
            return ResponseEntity.ok(team);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public TeamDTO createTeam(@RequestBody CreateTeamRequest request) { // <-- Change return type
        return teamService.createTeam(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable int id, @RequestBody CreateTeamRequest request) { // <-- Change return type
        TeamDTO updatedTeam = teamService.updateTeam(id, request);
        if (updatedTeam != null) {
            return ResponseEntity.ok(updatedTeam);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable int id) {
        return teamService.deleteTeam(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/count")
    public long getTeamCount() {
        return teamService.getTeamCount();
    }

    @GetMapping("/same-team")
    public ResponseEntity<Map<String, Boolean>> areOnSameTeam(@RequestParam int personId1, @RequestParam int personId2) {
        boolean result = teamService.areOnSameTeam(personId1, personId2);
        return ResponseEntity.ok(Map.of("areOnSameTeam", result));
    }
}