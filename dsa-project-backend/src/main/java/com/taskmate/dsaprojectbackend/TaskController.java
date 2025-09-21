// src/main/java/com/taskmate/dsaprojectbackend/TaskController.java
package com.taskmate.dsaprojectbackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping
    public Task addTask(@RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        String date = payload.get("date");
        String targetRole = payload.get("targetRole");
        return taskService.addTask(description, date, targetRole);
    }
    
    // NEW: Endpoint to update all task fields
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        String date = payload.get("date");
        String targetRole = payload.get("targetRole");
        Task updatedTask = taskService.updateTask(id, description, date, targetRole);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable int id) {
        boolean wasDeleted = taskService.deleteTask(id);
        if (wasDeleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Task updatedTask = taskService.updateTaskStatus(id, status);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    public long getActiveTaskCount() {
        return taskService.getActiveTaskCount();
    }
}