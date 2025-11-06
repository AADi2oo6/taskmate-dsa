package com.taskmate.dsaprojectbackend.common;

public class CircularQueue<T> {
    private T[] queue;
    private int front;
    private int rear;
    private int size;
    private int capacity;

    @SuppressWarnings("unchecked")
    public CircularQueue(int capacity) {
        this.capacity = capacity;
        this.queue = (T[]) new Object[capacity];
        this.front = 0;
        this.rear = 0;
        this.size = 0;
    }

    // Add an element to the rear of the queue
    public void enqueue(T element) {
        if (isFull()) {
            throw new RuntimeException("Queue is full");
        }
        
        queue[rear] = element;
        rear = (rear + 1) % capacity;
        size++;
    }

    // Remove and return the front element
    public T dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        
        T element = queue[front];
        queue[front] = null; // Help GC
        front = (front + 1) % capacity;
        size--;
        
        return element;
    }

    // View the front element without removing it
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return queue[front];
    }

    // Check if the queue is empty
    public boolean isEmpty() {
        return size == 0;
    }

    // Check if the queue is full
    public boolean isFull() {
        return size == capacity;
    }

    // Get the current size of the queue
    public int getSize() {
        return size;
    }

    // Get the capacity of the queue
    public int getCapacity() {
        return capacity;
    }
}