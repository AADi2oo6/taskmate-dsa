package com.taskmate.dsaprojectbackend.person;

import com.taskmate.dsaprojectbackend.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.taskmate.dsaprojectbackend.team.TeamService;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamTaskController {

    @Autowired
    private TeamService teamService;

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getTeamTasks(@PathVariable int id) {
        List<Task> tasks = teamService.getTasksForTeam(id);
        return ResponseEntity.ok(tasks);
    }
}