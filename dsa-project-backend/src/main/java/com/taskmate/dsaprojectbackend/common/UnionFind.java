package com.taskmate.dsaprojectbackend;

import java.util.HashMap;
import java.util.Map;

public class UnionFind {
    // Maps an item's ID to its parent's ID in the disjoint set.
    private Map<Integer, Integer> parent;
    // Maps the root of a set to the size of that set.
    private Map<Integer, Integer> size;

    public UnionFind() {
        this.parent = new HashMap<>();
        this.size = new HashMap<>();
    }

    /**
     * Adds a new item as its own set.
     */
    public void add(int item) {
        if (!parent.containsKey(item)) {
            parent.put(item, item); // The item is its own parent initially.
            size.put(item, 1);      // The set size is 1.
        }
    }

    /**
     * Finds the representative (root) of the set containing the given item,
     * with path compression for optimization.
     */
    public int find(int item) {
        if (!parent.containsKey(item)) {
            add(item); // Lazily add the item if it doesn't exist.
        }

        if (parent.get(item) == item) {
            return item;
        }
        // Path compression: set the parent directly to the root.
        int root = find(parent.get(item));
        parent.put(item, root);
        return root;
    }

    /**
     * Merges the sets containing itemA and itemB, using union by size for optimization.
     */
    public void union(int itemA, int itemB) {
        int rootA = find(itemA);
        int rootB = find(itemB);

        if (rootA != rootB) {
            // Union by size: attach the smaller tree to the root of the larger tree.
            if (size.get(rootA) < size.get(rootB)) {
                parent.put(rootA, rootB);
                size.put(rootB, size.get(rootA) + size.get(rootB));
            } else {
                parent.put(rootB, rootA);
                size.put(rootA, size.get(rootA) + size.get(rootB));
            }
        }
    }
}