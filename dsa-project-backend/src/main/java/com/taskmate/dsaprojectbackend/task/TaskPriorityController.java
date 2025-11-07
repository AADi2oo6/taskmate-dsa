package com.taskmate.dsaprojectbackend.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks/priority")
public class TaskPriorityController {

    @Autowired
    private TaskPriorityService taskPriorityService;
    
    @Autowired
    private TaskService taskService;

    // DTO for priority task response
    public static class PriorityTaskDTO {
        public int id;
        public String name;
        public int priority;
        public int daysLeft;
        
        public PriorityTaskDTO(int id, String name, int priority, int daysLeft) {
            this.id = id;
            this.name = name;
            this.priority = priority;
            this.daysLeft = daysLeft;
        }
    }

    // Get top 5 highest priority tasks
    @GetMapping("/top-5")
    public ResponseEntity<List<PriorityTaskDTO>> getTop5Tasks() {
        List<Task> topTasks = taskPriorityService.getTop5Tasks();
        
        List<PriorityTaskDTO> dtoList = topTasks.stream().map(task -> {
            int daysLeft = TaskPriorityService.calculateDaysLeft(task.getDeadline());
            return new PriorityTaskDTO(task.getId(), task.getDescription(), task.getPriority(), daysLeft);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtoList);
    }

    // Assign task to member
    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignTaskToMember(
            @RequestParam int taskId,
            @RequestParam int memberId) {
        
        boolean success = taskPriorityService.assignTaskToMember(taskId, memberId);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Task assigned successfully");
        } else {
            response.put("success", false);
            response.put("message", "Failed to assign task");
        }
        
        return ResponseEntity.ok(response);
    }

    // Refresh priorities
    @PutMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshPriorities() {
        taskPriorityService.refreshPriorityQueue();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Priorities refreshed");
        
        return ResponseEntity.ok(response);
    }
}