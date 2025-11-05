// src/main/java/com/taskmate/dsaprojectbackend/common/SinglyLinkedList.java
package com.taskmate.dsaprojectbackend.common;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class SinglyLinkedList<T> {
    private Node<T> head;

    private static class Node<T> {
        T data;
        Node<T> next;

        Node(T data) {
            this.data = data;
            this.next = null;
        }
    }

    // Insert at the end
    public void add(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode;
        } else {
            Node<T> temp = head;
            while (temp.next != null) {
                temp = temp.next;
            }
            temp.next = newNode;
        }
    }

    // Delete a node by value (useful for finding a task by ID)
    public boolean remove(T data) {
        if (head == null) {
            return false;
        }
        if (Objects.equals(head.data, data)) {
            head = head.next;
            return true;
        }
        Node<T> temp = head;
        while (temp.next != null && !Objects.equals(temp.next.data, data)) {
            temp = temp.next;
        }
        if (temp.next != null) {
            temp.next = temp.next.next;
            return true;
        }
        return false;
    }
    
    // More efficient remove method for tasks, using ID
    public boolean removeById(int id) {
        if (head == null) {
            return false;
        }
        // Assuming T is Task, we need a way to get the ID.
        // This requires a bit of a workaround or an interface.
        // For this specific project, we can cast.
        if (head.data instanceof com.taskmate.dsaprojectbackend.task.Task && 
            ((com.taskmate.dsaprojectbackend.task.Task) head.data).getId() == id) {
            head = head.next;
            return true;
        }

        Node<T> current = head;
        while (current.next != null) {
            if (current.next.data instanceof com.taskmate.dsaprojectbackend.task.Task && 
                ((com.taskmate.dsaprojectbackend.task.Task) current.next.data).getId() == id) {
                current.next = current.next.next;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // Find a task by its ID
    public T findById(int id) {
        Node<T> current = head;
        while (current != null) {
            if (current.data instanceof com.taskmate.dsaprojectbackend.task.Task && 
                ((com.taskmate.dsaprojectbackend.task.Task) current.data).getId() == id) {
                return current.data;
            }
            current = current.next;
        }
        return null;
    }

    // Convert to a List for easy return in API endpoints
    public List<T> toList() {
        List<T> list = new ArrayList<>();
        Node<T> temp = head;
        while (temp != null) {
            list.add(temp.data);
            temp = temp.next;
        }
        return list;
    }

    // Find a node by value
    public T find(T data) {
        Node<T> temp = head;
        while (temp != null) {
            if (Objects.equals(temp.data, data)) {
                return temp.data;
            }
            temp = temp.next;
        }
        return null;
    }
}