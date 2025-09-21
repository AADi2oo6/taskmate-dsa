// src/main/java/com/taskmate/dsaprojectbackend/TaskService.java
package com.taskmate.dsaprojectbackend;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final SinglyLinkedList<Task> tasks = new SinglyLinkedList<>();

    public TaskService() {
        tasks.add(new Task("Plan project meeting", "In Progress", "2025-09-22T12:00", "Manager"));
        tasks.add(new Task("Code backend feature", "In Progress", "2025-09-23T14:00", "Developer"));
    }

    public List<Task> getAllTasks() {
        return tasks.toList();
    }

    public Task addTask(String description, String date, String targetRole) {
        Task newTask = new Task(description, "Pending", date, targetRole);
        tasks.add(newTask);
        return newTask;
    }

    public boolean deleteTask(int id) {
        Task taskToRemove = null;
        for (Task task : tasks.toList()) {
            if (task.getId() == id) {
                taskToRemove = task;
                break;
            }
        }
        if (taskToRemove != null) {
            return tasks.remove(taskToRemove);
        }
        return false;
    }
    
    // UPDATED: This method now handles updating all task fields
    public Task updateTask(int id, String description, String date, String targetRole) {
        Task taskToUpdate = null;
        for (Task task : tasks.toList()) {
            if (task.getId() == id) {
                taskToUpdate = task;
                break;
            }
        }
        if (taskToUpdate != null) {
            taskToUpdate.setDescription(description);
            taskToUpdate.setDate(date);
            taskToUpdate.setTargetRole(targetRole);
            return taskToUpdate;
        }
        return null;
    }
    
    public Task updateTaskStatus(int id, String status) {
        Task taskToUpdate = null;
        for (Task task : tasks.toList()) {
            if (task.getId() == id) {
                taskToUpdate = task;
                break;
            }
        }
        if (taskToUpdate != null) {
            taskToUpdate.setStatus(status);
            return taskToUpdate;
        }
        return null;
    }
    
    public long getActiveTaskCount() {
        return tasks.toList().stream()
                .filter(task -> "Pending".equals(task.getStatus()) || "In Progress".equals(task.getStatus()))
                .count();
    }
}