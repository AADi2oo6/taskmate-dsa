// src/main/java/com/taskmate/dsaprojectbackend/Operation.java
package com.taskmate.dsaprojectbackend;

public class Operation {
    public enum Type { CREATE, UPDATE, DELETE }

    private final Type type;
    private final Person beforeState;
    private final Person afterState;

    public Operation(Type type, Person beforeState, Person afterState) {
        this.type = type;
        this.beforeState = beforeState;
        this.afterState = afterState;
    }

    public Type getType() {
        return type;
    }

    public Person getBeforeState() {
        return beforeState;
    }

    public Person getAfterState() {
        return afterState;
    }
}