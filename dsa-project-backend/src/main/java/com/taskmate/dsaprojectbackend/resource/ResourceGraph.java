package com.taskmate.dsaprojectbackend.resource;

import java.util.*;

public class ResourceGraph {

    // Adjacency list representation
    private Map<String, List<String>> adjacencyList = new HashMap<>();

    // Add a node (team, resource, or task)
    public void addNode(String nodeId) {
        adjacencyList.putIfAbsent(nodeId, new ArrayList<>());
    }

    // Add an edge (directed connection)
    public void addEdge(String from, String to) {
        adjacencyList.putIfAbsent(from, new ArrayList<>());
        adjacencyList.putIfAbsent(to, new ArrayList<>());
        adjacencyList.get(from).add(to);
    }

    // Get neighbors
    public List<String> getNeighbors(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, new ArrayList<>());
    }

    // Debug print
    public void printGraph() {
        for (String node : adjacencyList.keySet()) {
            System.out.println(node + " → " + adjacencyList.get(node));
        }
    }
}