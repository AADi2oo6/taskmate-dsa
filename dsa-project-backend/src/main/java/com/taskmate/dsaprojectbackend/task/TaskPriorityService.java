package com.taskmate.dsaprojectbackend.task;

import com.taskmate.dsaprojectbackend.common.PriorityQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaskPriorityService {
    
    @Autowired
    private TaskService taskService;
    
    private PriorityQueue priorityQueue;
    
    public TaskPriorityService() {
        this.priorityQueue = new PriorityQueue(100); // Max capacity of 100 tasks
    }
    
    // Get top 5 highest priority tasks
    public List<Task> getTop5Tasks() {
        refreshPriorityQueue();
        
        List<Task> topTasks = new ArrayList<>();
        PriorityQueue tempQueue = new PriorityQueue(100);
        
        // Extract up to 5 tasks
        int count = 0;
        while (count < 5 && !priorityQueue.isEmpty()) {
            Task task = priorityQueue.extractMin();
            if (task != null) {
                topTasks.add(task);
                tempQueue.insert(task);
                count++;
            }
        }
        
        // Restore tasks back to the original queue
        while (!tempQueue.isEmpty()) {
            priorityQueue.insert(tempQueue.extractMin());
        }
        
        return topTasks;
    }
    
    // Get the next highest priority task
    public Task getNextTask() {
        refreshPriorityQueue();
        return priorityQueue.peek();
    }
    
    // Assign task to member and remove from queue
    public boolean assignTaskToMember(int taskId, int memberId) {
        // Update task in database
        Task task = taskService.assignTask(taskId, memberId);
        return task != null;
    }
    
    // Refresh the priority queue based on current tasks
    public void refreshPriorityQueue() {
        priorityQueue = new PriorityQueue(100);
        List<Task> allTasks = taskService.getAllTasks();
        
        // Filter for pending tasks only
        for (Task task : allTasks) {
            if ("Pending".equals(task.getStatus()) && task.getAssignedPersonId() == null) {
                priorityQueue.insert(task);
            }
        }
    }
    
    // Calculate days left for a task
    public static int calculateDaysLeft(String deadline) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate deadlineDate = LocalDate.parse(deadline, formatter);
            LocalDate currentDate = LocalDate.now();
            return (int) ChronoUnit.DAYS.between(currentDate, deadlineDate);
        } catch (Exception e) {
            return 0;
        }
    }
}