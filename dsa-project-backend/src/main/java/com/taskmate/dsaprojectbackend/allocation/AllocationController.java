package com.taskmate.dsaprojectbackend.allocation;

import com.taskmate.dsaprojectbackend.resource.ResourceGraph;
import com.taskmate.dsaprojectbackend.resource.ResourceRepository;
import com.taskmate.dsaprojectbackend.team.Team;
import com.taskmate.dsaprojectbackend.team.TeamRepository;
import com.taskmate.dsaprojectbackend.task.TaskRepository;
import com.taskmate.dsaprojectbackend.person.PersonRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/allocations")
@CrossOrigin(origins = "http://localhost:3000")
public class AllocationController {

    private final AllocationRepository allocationRepository;
    private final ResourceRepository resourceRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final PersonRepository personRepository;

    public AllocationController(
            AllocationRepository allocationRepository,
            ResourceRepository resourceRepository,
            TeamRepository teamRepository,
            TaskRepository taskRepository,
            PersonRepository personRepository
    ) {
        this.allocationRepository = allocationRepository;
        this.resourceRepository = resourceRepository;
        this.teamRepository = teamRepository;
        this.taskRepository = taskRepository;
        this.personRepository = personRepository;
    }

    @GetMapping
    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createAllocation(@RequestBody AllocationRequest req) {
        try {
            var resource = resourceRepository.findById(req.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            var person = personRepository.findById(req.getResponsiblePersonId())
                    .orElseThrow(() -> new RuntimeException("Person not found"));

            var teams = teamRepository.findAllById(req.getTeamIds());
            var tasks = taskRepository.findAllById(req.getTaskIds());

            Allocation allocation = new Allocation();
            allocation.setResource(resource);
            allocation.setResponsiblePerson(person);
            allocation.setTeams(teams);
            allocation.setTasks(tasks);
            allocation.setSprintName(req.getSprintName());
            allocation.setStartTime(req.getStartTime());
            allocation.setEndTime(req.getEndTime());

            Allocation saved = allocationRepository.save(allocation);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to allocate resource: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAllocation(@PathVariable int id) {
        if (!allocationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Allocation not found");
        }
        allocationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
//     @Autowired
// private AllocationRepository allocationRepository;

// @GetMapping("/graph")
// public ResponseEntity<ResourceGraph> getGraph() {
//     ResourceGraph graph = new ResourceGraph();

//     List<Allocation> allocations = allocationRepository.findAll();

//     for (Allocation alloc : allocations) {
//         String resourceNode = "Resource_" + alloc.getResource().getId();

//         // Add nodes
//         graph.addNode(resourceNode);

//         // Connect Teams → Resource
//         for (Team t : alloc.getTeams()) {
//             String teamNode = "Team_" + t.getId();
//             graph.addNode(teamNode);
//             graph.addEdge(teamNode, resourceNode);
//         }

//         // Connect Resource → Tasks
//         for (Task task : alloc.getTasks()) {
//             String taskNode = "Task_" + task.getId();
//             graph.addNode(taskNode);
//             graph.addEdge(resourceNode, taskNode);
//         }
//     }

//     graph.printGraph();
//     return ResponseEntity.ok(graph);
// }

}
