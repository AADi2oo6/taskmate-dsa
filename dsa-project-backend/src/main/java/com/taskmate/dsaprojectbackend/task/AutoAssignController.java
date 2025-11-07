package com.taskmate.dsaprojectbackend.task;

import com.taskmate.dsaprojectbackend.person.Person;
import com.taskmate.dsaprojectbackend.person.PersonDTO;
import com.taskmate.dsaprojectbackend.person.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class AutoAssignController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private PersonService personService;

    // DTO for auto-assign request
    public static class AutoAssignRequest {
        public String strategy;
        public List<Integer> memberIds;
        public int taskLimit;
    }

    // DTO for assignment response
    public static class AssignmentResponse {
        public boolean success;
        public int assignedCount;
        public Map<String, Integer> distribution;
        public String message;
    }

    // DTO for member stats response
    public static class MemberStat {
        public int id;
        public String name;
        public int tasks;
        
        public MemberStat(int id, String name, int tasks) {
            this.id = id;
            this.name = name;
            this.tasks = tasks;
        }
    }

    // Auto-assign tasks
    @PostMapping("/auto-assign")
    public ResponseEntity<AssignmentResponse> autoAssignTasks(@RequestBody AutoAssignRequest request) {
        AssignmentResponse response = new AssignmentResponse();
        
        try {
            // Get all unassigned tasks
            List<Task> allTasks = taskService.getAllTasks();
            List<Task> unassignedTasks = allTasks.stream()
                .filter(task -> task.getAssignedPersonId() == null && "Pending".equals(task.getStatus()))
                .collect(Collectors.toList());
            
            // Limit tasks if specified
            if (request.taskLimit > 0 && request.taskLimit < unassignedTasks.size()) {
                unassignedTasks = unassignedTasks.subList(0, request.taskLimit);
            }
            
            // Get members
            List<PersonDTO> allMembers = personService.getAllPeople();
            List<PersonDTO> selectedMembers = allMembers.stream()
                .filter(person -> request.memberIds.contains(person.getId()))
                .collect(Collectors.toList());
            
            if (selectedMembers.isEmpty()) {
                response.success = false;
                response.message = "No valid members selected";
                return ResponseEntity.ok(response);
            }
            
            // Initialize assigner
            RoundRobinAssigner assigner = new RoundRobinAssigner();
            assigner.initialize(selectedMembers);
            
            // Get current task counts for each member
            Map<Integer, Integer> memberTaskCounts = new HashMap<>();
            for (PersonDTO person : allMembers) {
                // Count tasks assigned to this person
                int taskCount = (int) allTasks.stream()
                    .filter(task -> task.getAssignedPersonId() != null && task.getAssignedPersonId() == person.getId())
                    .count();
                memberTaskCounts.put(person.getId(), taskCount);
            }
            
            // Perform assignment
            Map<Integer, Integer> distribution = assigner.assignTasks(
                unassignedTasks, 
                request.strategy, 
                memberTaskCounts
            );
            
            // Update tasks in database
            int assignedCount = 0;
            for (Task task : unassignedTasks) {
                // Find a member to assign this task to
                for (Map.Entry<Integer, Integer> entry : distribution.entrySet()) {
                    int memberId = entry.getKey();
                    int assignedTasks = entry.getValue();
                    
                    // Check if this member should get this task
                    if (assignedTasks > 0) {
                        taskService.assignTask(task.getId(), memberId);
                        entry.setValue(assignedTasks - 1); // Decrement count
                        assignedCount++;
                        break;
                    }
                }
            }
            
            response.success = true;
            response.assignedCount = assignedCount;
            response.distribution = distribution.entrySet().stream()
                .collect(Collectors.toMap(e -> String.valueOf(e.getKey()), Map.Entry::getValue));
            response.message = assignedCount + " tasks assigned successfully";
            
        } catch (Exception e) {
            response.success = false;
            response.message = "Failed to assign tasks: " + e.getMessage();
        }
        
        return ResponseEntity.ok(response);
    }

    // Get assignment statistics
    @GetMapping("/assignment-stats")
    public ResponseEntity<Map<String, MemberStat>> getAssignmentStats() {
        List<PersonDTO> allMembers = personService.getAllPeople();
        List<Task> allTasks = taskService.getAllTasks();
        
        Map<String, MemberStat> stats = new HashMap<>();
        
        for (PersonDTO person : allMembers) {
            // Count tasks assigned to this person
            int taskCount = (int) allTasks.stream()
                .filter(task -> task.getAssignedPersonId() != null && task.getAssignedPersonId() == person.getId())
                .count();
            
            stats.put(String.valueOf(person.getId()), new MemberStat(person.getId(), person.getName(), taskCount));
        }
        
        return ResponseEntity.ok(stats);
    }

    // Get available members
    @GetMapping("/members/available")
    public ResponseEntity<List<MemberStat>> getAvailableMembers() {
        List<PersonDTO> allMembers = personService.getAllPeople();
        List<Task> allTasks = taskService.getAllTasks();
        
        List<MemberStat> availableMembers = new ArrayList<>();
        
        for (PersonDTO person : allMembers) {
            // Count tasks assigned to this person
            int taskCount = (int) allTasks.stream()
                .filter(task -> task.getAssignedPersonId() != null && task.getAssignedPersonId() == person.getId())
                .count();
            
            availableMembers.add(new MemberStat(person.getId(), person.getName(), taskCount));
        }
        
        return ResponseEntity.ok(availableMembers);
    }
}