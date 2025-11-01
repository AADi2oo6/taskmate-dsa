package com.taskmate.dsaprojectbackend;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class AVLTree<T> {
    private AVLNode<T> root;
    private final Comparator<T> comparator;

    public AVLTree(Comparator<T> comparator) {
        this.comparator = comparator;
    }

    // Get height of node
    private int height(AVLNode<T> node) {
        return (node == null) ? 0 : node.height;
    }

    // Get balance factor of node
    private int getBalance(AVLNode<T> node) {
        return (node == null) ? 0 : height(node.left) - height(node.right);
    }

    // Right rotate subtree rooted with y
    private AVLNode<T> rightRotate(AVLNode<T> y) {
        AVLNode<T> x = y.left;
        AVLNode<T> T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;

        return x;
    }

    // Left rotate subtree rooted with x
    private AVLNode<T> leftRotate(AVLNode<T> x) {
        AVLNode<T> y = x.right;
        AVLNode<T> T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;

        return y;
    }

    // Insert a node
    public void insert(T data) {
        root = insert(root, data);
    }

    private AVLNode<T> insert(AVLNode<T> node, T data) {
        // 1. Perform standard BST insertion
        if (node == null) {
            return new AVLNode<>(data);
        }

        if (comparator.compare(data, node.data) < 0) {
            node.left = insert(node.left, data);
        } else if (comparator.compare(data, node.data) > 0) {
            node.right = insert(node.right, data);
        } else { // Duplicate data not allowed
            return node;
        }

        // 2. Update height of this ancestor node
        node.height = 1 + Math.max(height(node.left), height(node.right));

        // 3. Get the balance factor of this ancestor node to check whether this node became unbalanced
        int balance = getBalance(node);

        // If this node becomes unbalanced, then there are 4 cases

        // Left Left Case
        if (balance > 1 && comparator.compare(data, node.left.data) < 0) {
            return rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && comparator.compare(data, node.right.data) > 0) {
            return leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && comparator.compare(data, node.left.data) > 0) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && comparator.compare(data, node.right.data) < 0) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }

    // Method to get all elements in sorted order (in-order traversal)
    public List<T> getInOrder() {
        List<T> result = new ArrayList<>();
        inOrder(root, result);
        return result;
    }

    private void inOrder(AVLNode<T> node, List<T> result) {
        if (node != null) {
            inOrder(node.left, result);
            result.add(node.data);
            inOrder(node.right, result);
        }
    }

    // Method to find elements within a given range
    public List<T> findInRange(T min, T max) {
        List<T> result = new ArrayList<>();
        findInRange(root, min, max, result);
        return result;
    }

    private void findInRange(AVLNode<T> node, T min, T max, List<T> result) {
        if (node == null) {
            return;
        }

        // If current node's data is greater than min, search in the left subtree
        if (comparator.compare(node.data, min) > 0) {
            findInRange(node.left, min, max, result);
        }

        // If current node's data is within the range, add it to the list
        if (comparator.compare(node.data, min) >= 0 && comparator.compare(node.data, max) <= 0) {
            result.add(node.data);
        }

        // If current node's data is less than max, search in the right subtree
        if (comparator.compare(node.data, max) < 0) {
            findInRange(node.right, min, max, result);
        }
    }

    // Deletion (simplified for this example, a full implementation is more complex)
    // For a production system, a full AVL deletion with rebalancing would be required.
    // For this project, we can clear and rebuild the tree on delete/update for simplicity.
    public void clear() {
        root = null;
    }
}