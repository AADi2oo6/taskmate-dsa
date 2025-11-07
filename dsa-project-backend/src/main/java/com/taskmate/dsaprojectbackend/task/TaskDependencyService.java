package com.taskmate.dsaprojectbackend.task;

import com.taskmate.dsaprojectbackend.common.TaskDependencyGraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskDependencyService {
    
    @Autowired
    private TaskService taskService;
    
    private TaskDependencyGraph dependencyGraph;
    
    public TaskDependencyService() {
        this.dependencyGraph = new TaskDependencyGraph();
    }
    
    // Validate and add dependency, checking for cycles
    public boolean validateAndAddDependency(int prereqId, int dependentId) throws Exception {
        // Add the edge temporarily
        dependencyGraph.addEdge(prereqId, dependentId);
        
        // Check for cycles
        if (dependencyGraph.detectCycle()) {
            // Remove the edge if it creates a cycle
            dependencyGraph.removeEdge(prereqId, dependentId);
            throw new Exception("Circular dependency detected");
        }
        
        return true;
    }
    
    // Get task order (topological sort)
    public List<Integer> getTaskOrder() {
        return dependencyGraph.topologicalSort();
    }
    
    // Get critical path
    public List<Integer> getCriticalPath() {
        return dependencyGraph.findCriticalPath();
    }
    
    // Get all tasks affected by a delay in a specific task
    public List<Integer> getAffectedTasks(int taskId) {
        return dependencyGraph.getImpactAnalysis(taskId);
    }
    
    // Remove a dependency
    public void removeDependency(int prereqId, int dependentId) {
        dependencyGraph.removeEdge(prereqId, dependentId);
    }
    
    // Get the dependency graph
    public TaskDependencyGraph getDependencyGraph() {
        return dependencyGraph;
    }
}