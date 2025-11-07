package com.taskmate.dsaprojectbackend.task;

import com.taskmate.dsaprojectbackend.common.CircularQueue;
import com.taskmate.dsaprojectbackend.person.Person;
import com.taskmate.dsaprojectbackend.person.PersonDTO;

import java.util.*;

public class RoundRobinAssigner {
    private CircularQueue<PersonDTO> memberQueue;
    
    public RoundRobinAssigner() {
        // Initialize with reasonable capacity
        this.memberQueue = new CircularQueue<>(100);
    }
    
    // Initialize the queue with members
    public void initialize(List<PersonDTO> members) {
        // Clear existing queue
        while (!memberQueue.isEmpty()) {
            memberQueue.dequeue();
        }
        
        // Add all members to the queue
        for (PersonDTO member : members) {
            memberQueue.enqueue(member);
        }
    }
    
    // Assign tasks using round robin strategy
    public Map<Integer, Integer> assignTasks(List<Task> unassignedTasks, String strategy, Map<Integer, Integer> memberTaskCounts) {
        Map<Integer, Integer> assignmentDistribution = new HashMap<>();
        
        switch (strategy.toUpperCase()) {
            case "ROUND_ROBIN":
                assignByRoundRobin(unassignedTasks, assignmentDistribution, memberTaskCounts);
                break;
            case "BY_WORKLOAD":
                assignByWorkload(unassignedTasks, assignmentDistribution, memberTaskCounts);
                break;
            case "BY_SKILL_MATCH":
                assignBySkillMatch(unassignedTasks, assignmentDistribution, memberTaskCounts);
                break;
            default:
                assignByRoundRobin(unassignedTasks, assignmentDistribution, memberTaskCounts);
        }
        
        return assignmentDistribution;
    }
    
    // Assign tasks using round robin approach
    private void assignByRoundRobin(List<Task> unassignedTasks, Map<Integer, Integer> distribution, Map<Integer, Integer> memberTaskCounts) {
        for (Task task : unassignedTasks) {
            if (!memberQueue.isEmpty()) {
                // Get the next member in rotation
                PersonDTO member = memberQueue.dequeue();
                
                // Update distribution count
                distribution.put(member.getId(), distribution.getOrDefault(member.getId(), 0) + 1);
                
                // Update member task count
                memberTaskCounts.put(member.getId(), memberTaskCounts.getOrDefault(member.getId(), 0) + 1);
                
                // Put the member back at the end of the queue
                memberQueue.enqueue(member);
            }
        }
    }
    
    // Assign tasks to members with least workload
    private void assignByWorkload(List<Task> unassignedTasks, Map<Integer, Integer> distribution, Map<Integer, Integer> memberTaskCounts) {
        // Create a sorted list of members by current task count
        List<Map.Entry<Integer, Integer>> sortedMembers = new ArrayList<>(memberTaskCounts.entrySet());
        sortedMembers.sort(Map.Entry.comparingByValue());
        
        int memberIndex = 0;
        for (Task task : unassignedTasks) {
            if (!sortedMembers.isEmpty()) {
                // Assign to member with least tasks
                Map.Entry<Integer, Integer> memberEntry = sortedMembers.get(memberIndex);
                int memberId = memberEntry.getKey();
                
                // Update distribution count
                distribution.put(memberId, distribution.getOrDefault(memberId, 0) + 1);
                
                // Update member task count
                memberTaskCounts.put(memberId, memberTaskCounts.get(memberId) + 1);
                
                // Update sorted list
                memberEntry.setValue(memberEntry.getValue() + 1);
                sortedMembers.sort(Map.Entry.comparingByValue());
                
                memberIndex = (memberIndex + 1) % sortedMembers.size();
            }
        }
    }
    
    // Assign tasks based on skill matching (simplified implementation)
    private void assignBySkillMatch(List<Task> unassignedTasks, Map<Integer, Integer> distribution, Map<Integer, Integer> memberTaskCounts) {
        // For simplicity, we'll use round robin for skill match as well
        // In a real implementation, we would match task roles with person roles
        assignByRoundRobin(unassignedTasks, distribution, memberTaskCounts);
    }
    
    // Get current assignment statistics
    public Map<Integer, Integer> getAssignmentStats() {
        // This would return current stats in a real implementation
        return new HashMap<>();
    }
}