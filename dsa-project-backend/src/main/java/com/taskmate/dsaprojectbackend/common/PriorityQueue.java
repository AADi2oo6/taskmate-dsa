package com.taskmate.dsaprojectbackend.common;

import com.taskmate.dsaprojectbackend.task.Task;
import java.util.Comparator;

public class PriorityQueue {
    private Task[] heap;
    private int size;
    private int capacity;
    
    // Comparator for comparing tasks by priority (lower number = higher urgency)
    private Comparator<Task> priorityComparator = (t1, t2) -> Integer.compare(t1.getPriority(), t2.getPriority());

    public PriorityQueue(int capacity) {
        this.capacity = capacity;
        this.heap = new Task[capacity];
        this.size = 0;
    }

    // Insert a task into the priority queue
    public void insert(Task task) {
        if (size >= capacity) {
            throw new RuntimeException("Priority queue is full");
        }
        
        heap[size] = task;
        heapifyUp(size);
        size++;
    }

    // Extract the minimum priority task (highest urgency)
    public Task extractMin() {
        if (size <= 0) {
            return null;
        }
        
        Task minTask = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapifyDown(0);
        
        return minTask;
    }

    // Peek at the minimum priority task without removing it
    public Task peek() {
        if (size <= 0) {
            return null;
        }
        return heap[0];
    }

    // Heapify up operation to maintain min-heap property
    private void heapifyUp(int index) {
        if (index <= 0) {
            return;
        }
        
        int parentIndex = (index - 1) / 2;
        if (priorityComparator.compare(heap[index], heap[parentIndex]) < 0) {
            // Swap
            Task temp = heap[index];
            heap[index] = heap[parentIndex];
            heap[parentIndex] = temp;
            
            // Continue heapifying up
            heapifyUp(parentIndex);
        }
    }

    // Heapify down operation to maintain min-heap property
    private void heapifyDown(int index) {
        int leftChild = 2 * index + 1;
        int rightChild = 2 * index + 2;
        int smallest = index;
        
        if (leftChild < size && priorityComparator.compare(heap[leftChild], heap[smallest]) < 0) {
            smallest = leftChild;
        }
        
        if (rightChild < size && priorityComparator.compare(heap[rightChild], heap[smallest]) < 0) {
            smallest = rightChild;
        }
        
        if (smallest != index) {
            // Swap
            Task temp = heap[index];
            heap[index] = heap[smallest];
            heap[smallest] = temp;
            
            // Continue heapifying down
            heapifyDown(smallest);
        }
    }

    // Get current size of the priority queue
    public int getSize() {
        return size;
    }

    // Check if the priority queue is empty
    public boolean isEmpty() {
        return size == 0;
    }

    // Check if the priority queue is full
    public boolean isFull() {
        return size >= capacity;
    }
}