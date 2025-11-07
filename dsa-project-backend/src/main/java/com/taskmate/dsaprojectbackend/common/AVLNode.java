package com.taskmate.dsaprojectbackend;

public class AVLNode<T> {
    T data;
    int height;
    AVLNode<T> left;
    AVLNode<T> right;

    AVLNode(T data) {
        this.data = data;
        this.height = 1; // New node is initially added at leaf
    }
}