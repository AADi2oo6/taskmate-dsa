// src/main/java/com/taskmate/dsaprojectbackend/common/Operation.java
package com.taskmate.dsaprojectbackend.common;

import com.taskmate.dsaprojectbackend.person.Person;

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