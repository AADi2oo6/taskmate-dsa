// src/main/java/com/taskmate/dsaprojectbackend/TaskService.java
package com.taskmate.dsaprojectbackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // You can add initial data via a CommandLineRunner bean if needed

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task addTask(Task task) {
        // Ensure new tasks always start with a "Pending" status and are unassigned.
        Task newTask = new Task(task.getDescription(), "Pending", task.getDate(), task.getTargetRole());
        newTask.setAssignedPersonId(null);
        return taskRepository.save(newTask);
    }

    public boolean deleteTask(int id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // UPDATED: This method now handles updating all task fields
    public Task updateTask(int id, String description, String date, String targetRole) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setDescription(description);
            task.setDate(date);
            task.setTargetRole(targetRole);
            return taskRepository.save(task);
        }
        return null;
    }
    
    public Task updateTaskStatus(int id, String status) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setStatus(status);
            return taskRepository.save(task);
        }
        return null;
    }

    public Task assignTask(int taskId, int personId) {
        Optional<Task> taskOptional = taskRepository.findById(taskId);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setAssignedPersonId(personId);
            task.setStatus("In Progress"); // Update status upon assignment
            return taskRepository.save(task);
        }
        return null;
    }
    
    public long getActiveTaskCount() {
        return taskRepository.findAll().stream()
                .filter(task -> "Pending".equals(task.getStatus()) || "In Progress".equals(task.getStatus()))
                .count();
    }
}