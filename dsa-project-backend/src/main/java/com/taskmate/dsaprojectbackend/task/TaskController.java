// src/main/java/com/taskmate/dsaprojectbackend/task/TaskController.java
package com.taskmate.dsaprojectbackend.task;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/sorted")
    public List<Task> getSortedTasks(@RequestParam String by) {
        return taskService.getSortedTasks(by);
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping
    public Task addTask(@RequestBody Task task) {
        return taskService.addTask(task);
    }
    
    @PostMapping("/dto")
    public Task addTaskFromDTO(@RequestBody TaskDTO taskDTO) {
        return taskService.addTaskFromDTO(taskDTO);
    }
    
    // NEW: Endpoint to update all task fields including priority and deadline
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable int id, @RequestBody Task task) {
        Task updatedTask = taskService.updateTaskWithDetails(
            id, 
            task.getDescription(), 
            task.getDate(), 
            task.getTargetRole(),
            task.getPriority(),
            task.getDeadline()
        );
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

    @PutMapping("/{id}/assign")
    public ResponseEntity<Task> assignTask(@PathVariable int id, @RequestBody Map<String, Integer> payload) {
        if (!payload.containsKey("personId")) {
            return ResponseEntity.badRequest().build();
        }
        Integer personId = payload.get("personId");
        Task assignedTask = taskService.assignTask(id, personId);
        return assignedTask != null 
            ? ResponseEntity.ok(assignedTask) 
            : ResponseEntity.notFound().build();
    }

    @GetMapping("/count")
    public long getActiveTaskCount() {
        return taskService.getActiveTaskCount();
    }
    
    // New endpoint to update task priority
    @PutMapping("/{id}/priority")
    public ResponseEntity<Task> updateTaskPriority(@PathVariable int id, @RequestBody Map<String, Integer> payload) {
        Integer priority = payload.get("priority");
        if (priority == null) {
            return ResponseEntity.badRequest().build();
        }
        Task updatedTask = taskService.updateTaskPriority(id, priority);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // New endpoint to update task deadline
    @PutMapping("/{id}/deadline")
    public ResponseEntity<Task> updateTaskDeadline(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String deadline = payload.get("deadline");
        if (deadline == null) {
            return ResponseEntity.badRequest().build();
        }
        Task updatedTask = taskService.updateTaskDeadline(id, deadline);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}