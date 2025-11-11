// src/main/java/com/taskmate/dsa-project-backend/task/TaskService.java
package com.taskmate.dsaprojectbackend.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort; // <-- ADD THIS IMPORT
import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final String CSV_FILE_PATH = Paths.get("../tasks_data.csv").toAbsolutePath().toString();

    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @PostConstruct
    public void init() {
        // Load tasks from CSV on startup if database is empty
        if (taskRepository.count() == 0) {
            loadTasksFromCSV();
        }
    }

    // Load tasks data from CSV file
    private void loadTasksFromCSV() {
        try (BufferedReader br = new BufferedReader(new FileReader(CSV_FILE_PATH))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }
                
                String[] values = line.split(",");
                if (values.length >= 6) {
                    Task task = new Task();
                    task.setDescription(values[0].trim());
                    task.setStatus(values[1].trim());
                    task.setDate(values[2].trim());
                    task.setTargetRole(values[3].trim());
                    task.setPriority(Integer.parseInt(values[4].trim()));
                    task.setDeadline(values[5].trim());
                    
                    // Set assigned person ID if present
                    if (values.length > 6 && !values[6].trim().isEmpty()) {
                        task.setAssignedPersonId(Integer.parseInt(values[6].trim()));
                    } else {
                        task.setAssignedPersonId(null);
                    }
                    
                    taskRepository.save(task);
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.out.println("Could not load tasks CSV file: " + e.getMessage());
        }
    }

    // You can add initial data via a CommandLineRunner bean if needed

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getSortedTasks(String sortBy) {
        Sort sort;

        switch (sortBy) {
            case "priority":
                // Sorts by the 'priority' field, ascending (1, 2, 3...)
                sort = Sort.by(Sort.Direction.ASC, "priority");
                break;

            case "deadline":
                // Sorts by the 'deadline' field, ascending (earliest date first)
                // This works because your ISO date strings are alphabetically sortable
                sort = Sort.by(Sort.Direction.ASC, "deadline");
                break;

            case "both":
                // Sorts by priority first, then by deadline
                sort = Sort.by(Sort.Direction.ASC, "priority")
                        .and(Sort.by(Sort.Direction.ASC, "deadline"));
                break;

            default:
                // Default case, just return by ID
                sort = Sort.by(Sort.Direction.ASC, "id");
                break;
        }

        // Find all tasks and apply the sort
        return taskRepository.findAll(sort);
    }
    // --- END OF NEW METHOD ---

    public Task addTask(Task task) {
        // Ensure new tasks always start with a "Pending" status and are unassigned.
        Task newTask = new Task(
            task.getDescription(), 
            "Pending", 
            task.getDate(), 
            task.getTargetRole(),
            task.getPriority() > 0 ? task.getPriority() : 3, // Default to medium priority if not set
            task.getDeadline() != null ? task.getDeadline() : task.getDate() // Default to date if deadline not set
        );
        newTask.setAssignedPersonId(null);
        return taskRepository.save(newTask);
    }
    
    public Task addTaskFromDTO(TaskDTO taskDTO) {
        // Ensure new tasks always start with a "Pending" status and are unassigned.
        Task newTask = new Task(
            taskDTO.getDescription(), 
            "Pending", 
            taskDTO.getDate(), 
            taskDTO.getTargetRole(),
            taskDTO.getPriority() > 0 ? taskDTO.getPriority() : 3, // Default to medium priority if not set
            taskDTO.getDeadline() != null ? taskDTO.getDeadline() : taskDTO.getDate() // Default to date if deadline not set
        );
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
    
    // New method to update task priority
    public Task updateTaskPriority(int id, int priority) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setPriority(priority);
            return taskRepository.save(task);
        }
        return null;
    }
    
    // New method to update task deadline
    public Task updateTaskDeadline(int id, String deadline) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setDeadline(deadline);
            return taskRepository.save(task);
        }
        return null;
    }
    
    // New method to update all task fields including priority and deadline
    public Task updateTaskWithDetails(int id, String description, String date, String targetRole, int priority, String deadline) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setDescription(description);
            task.setDate(date);
            task.setTargetRole(targetRole);
            task.setPriority(priority);
            task.setDeadline(deadline);
            return taskRepository.save(task);
        }
        return null;
    }
}