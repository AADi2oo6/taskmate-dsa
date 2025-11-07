package com.taskmate.dsaprojectbackend.task;

import com.taskmate.dsaprojectbackend.common.TaskDependencyGraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks/dependencies")
public class TaskDependencyController {

    @Autowired
    private TaskDependencyService taskDependencyService;
    
    @Autowired
    private TaskService taskService;

    // DTO for dependency request
    public static class DependencyRequest {
        public int prerequisiteTaskId;
        public int dependentTaskId;
    }

    // DTO for graph response
    public static class GraphResponse {
        public List<Node> nodes;
        public List<Edge> edges;
        
        public GraphResponse(List<Node> nodes, List<Edge> edges) {
            this.nodes = nodes;
            this.edges = edges;
        }
    }

    // DTO for node
    public static class Node {
        public int id;
        public String name;
        
        public Node(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    // DTO for edge
    public static class Edge {
        public int from;
        public int to;
        
        public Edge(int from, int to) {
            this.from = from;
            this.to = to;
        }
    }

    // Add dependency
    @PostMapping
    public ResponseEntity<Map<String, Object>> addDependency(@RequestBody DependencyRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = taskDependencyService.validateAndAddDependency(
                request.prerequisiteTaskId, 
                request.dependentTaskId
            );
            
            response.put("success", success);
            if (success) {
                response.put("message", "Dependency added successfully");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // Get dependency graph
    @GetMapping("/graph")
    public ResponseEntity<GraphResponse> getDependencyGraph() {
        // Get all tasks to build node list
        List<Task> allTasks = taskService.getAllTasks();
        List<Node> nodes = allTasks.stream()
            .map(task -> new Node(task.getId(), task.getDescription()))
            .collect(Collectors.toList());
        
        // Get edges from dependency graph
        TaskDependencyGraph graph = taskDependencyService.getDependencyGraph();
        List<Edge> edges = graph.getEdges().stream()
            .map(edge -> new Edge(edge.from, edge.to))
            .collect(Collectors.toList());
        
        GraphResponse response = new GraphResponse(nodes, edges);
        return ResponseEntity.ok(response);
    }

    // Get critical path
    @GetMapping("/critical-path")
    public ResponseEntity<List<Integer>> getCriticalPath() {
        List<Integer> criticalPath = taskDependencyService.getCriticalPath();
        return ResponseEntity.ok(criticalPath);
    }

    // Get impact analysis
    @GetMapping("/{taskId}/impact-analysis")
    public ResponseEntity<List<Integer>> getImpactAnalysis(@PathVariable int taskId) {
        List<Integer> affectedTasks = taskDependencyService.getAffectedTasks(taskId);
        return ResponseEntity.ok(affectedTasks);
    }

    // Remove dependency
    @DeleteMapping("/{prereqId}/{dependentId}")
    public ResponseEntity<Map<String, Object>> removeDependency(
            @PathVariable int prereqId,
            @PathVariable int dependentId) {
        
        taskDependencyService.removeDependency(prereqId, dependentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dependency removed successfully");
        
        return ResponseEntity.ok(response);
    }
}