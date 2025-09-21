// src/main/java/com/taskmate/dsaprojectbackend/SinglyLinkedList.java
package com.taskmate.dsaprojectbackend;

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