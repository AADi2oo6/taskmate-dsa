package com.taskmate.dsaprojectbackend.common;

import java.util.*;

public class TaskDependencyGraph {
    // Adjacency list representation
    private Map<Integer, List<Integer>> adjacencyList;
    
    public TaskDependencyGraph() {
        this.adjacencyList = new HashMap<>();
    }
    
    // Add a task node to the graph
    public void addVertex(int taskId) {
        if (!adjacencyList.containsKey(taskId)) {
            adjacencyList.put(taskId, new ArrayList<>());
        }
    }
    
    // Add a dependency edge (prerequisiteTaskId -> dependentTaskId)
    public void addEdge(int fromId, int toId) {
        // Ensure both vertices exist
        addVertex(fromId);
        addVertex(toId);
        
        // Add edge
        adjacencyList.get(fromId).add(toId);
    }
    
    // Remove a dependency edge
    public void removeEdge(int fromId, int toId) {
        if (adjacencyList.containsKey(fromId)) {
            adjacencyList.get(fromId).remove(Integer.valueOf(toId));
        }
    }
    
    // Detect cycle in the graph using DFS
    public boolean detectCycle() {
        Set<Integer> visited = new HashSet<>();
        Set<Integer> recursionStack = new HashSet<>();
        
        for (Integer taskId : adjacencyList.keySet()) {
            if (!visited.contains(taskId)) {
                if (detectCycleUtil(taskId, visited, recursionStack)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Utility method for cycle detection
    private boolean detectCycleUtil(int taskId, Set<Integer> visited, Set<Integer> recursionStack) {
        visited.add(taskId);
        recursionStack.add(taskId);
        
        List<Integer> neighbors = adjacencyList.get(taskId);
        if (neighbors != null) {
            for (Integer neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    if (detectCycleUtil(neighbor, visited, recursionStack)) {
                        return true;
                    }
                } else if (recursionStack.contains(neighbor)) {
                    return true; // Back edge detected - cycle found
                }
            }
        }
        
        recursionStack.remove(taskId);
        return false;
    }
    
    // Topological sort using Kahn's algorithm
    public List<Integer> topologicalSort() {
        // Calculate in-degrees
        Map<Integer, Integer> inDegree = new HashMap<>();
        
        // Initialize in-degrees to 0
        for (Integer taskId : adjacencyList.keySet()) {
            inDegree.putIfAbsent(taskId, 0);
        }
        
        // Calculate actual in-degrees
        for (List<Integer> neighbors : adjacencyList.values()) {
            for (Integer neighbor : neighbors) {
                inDegree.put(neighbor, inDegree.getOrDefault(neighbor, 0) + 1);
            }
        }
        
        // Queue for nodes with 0 in-degree
        Queue<Integer> queue = new LinkedList<>();
        for (Map.Entry<Integer, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }
        
        List<Integer> result = new ArrayList<>();
        
        while (!queue.isEmpty()) {
            Integer taskId = queue.poll();
            result.add(taskId);
            
            // Reduce in-degree of neighbors
            List<Integer> neighbors = adjacencyList.get(taskId);
            if (neighbors != null) {
                for (Integer neighbor : neighbors) {
                    inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                    if (inDegree.get(neighbor) == 0) {
                        queue.add(neighbor);
                    }
                }
            }
        }
        
        return result;
    }
    
    // Find critical path (longest path in DAG)
    public List<Integer> findCriticalPath() {
        // First check if graph has cycles
        if (detectCycle()) {
            throw new RuntimeException("Cannot find critical path in a cyclic graph");
        }
        
        // Topological sort
        List<Integer> topoOrder = topologicalSort();
        
        // Initialize distances to negative infinity
        Map<Integer, Integer> distances = new HashMap<>();
        Map<Integer, Integer> predecessors = new HashMap<>();
        
        for (Integer taskId : adjacencyList.keySet()) {
            distances.put(taskId, Integer.MIN_VALUE);
            predecessors.put(taskId, -1);
        }
        
        // Set distance of first node to 0
        if (!topoOrder.isEmpty()) {
            distances.put(topoOrder.get(0), 0);
        }
        
        // Process vertices in topological order
        for (Integer taskId : topoOrder) {
            if (distances.get(taskId) != Integer.MIN_VALUE) {
                List<Integer> neighbors = adjacencyList.get(taskId);
                if (neighbors != null) {
                    for (Integer neighbor : neighbors) {
                        // Update distance if longer path found
                        if (distances.get(neighbor) < distances.get(taskId) + 1) {
                            distances.put(neighbor, distances.get(taskId) + 1);
                            predecessors.put(neighbor, taskId);
                        }
                    }
                }
            }
        }
        
        // Find the vertex with maximum distance
        int maxDistance = Integer.MIN_VALUE;
        int lastNode = -1;
        
        for (Map.Entry<Integer, Integer> entry : distances.entrySet()) {
            if (entry.getValue() > maxDistance) {
                maxDistance = entry.getValue();
                lastNode = entry.getKey();
            }
        }
        
        // Reconstruct path
        List<Integer> criticalPath = new ArrayList<>();
        int currentNode = lastNode;
        
        while (currentNode != -1) {
            criticalPath.add(0, currentNode);
            currentNode = predecessors.get(currentNode);
        }
        
        return criticalPath;
    }
    
    // Get all tasks affected by a delay in a specific task
    public List<Integer> getImpactAnalysis(int taskId) {
        List<Integer> affectedTasks = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        dfsForImpact(taskId, visited, affectedTasks);
        return affectedTasks;
    }
    
    // DFS to find all downstream tasks
    private void dfsForImpact(int taskId, Set<Integer> visited, List<Integer> affectedTasks) {
        visited.add(taskId);
        List<Integer> neighbors = adjacencyList.get(taskId);
        
        if (neighbors != null) {
            for (Integer neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    affectedTasks.add(neighbor);
                    dfsForImpact(neighbor, visited, affectedTasks);
                }
            }
        }
    }
    
    // Get all edges in the graph
    public List<Edge> getEdges() {
        List<Edge> edges = new ArrayList<>();
        
        for (Map.Entry<Integer, List<Integer>> entry : adjacencyList.entrySet()) {
            int from = entry.getKey();
            for (Integer to : entry.getValue()) {
                edges.add(new Edge(from, to));
            }
        }
        
        return edges;
    }
    
    // Inner class for representing edges
    public static class Edge {
        public int from;
        public int to;
        
        public Edge(int from, int to) {
            this.from = from;
            this.to = to;
        }
    }
}