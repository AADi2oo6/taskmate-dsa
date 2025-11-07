// src/main/java/com/taskmate/dsaprojectbackend/PersonService.java
package com.taskmate.dsaprojectbackend;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.Collections;
import java.util.Comparator;

@Service
public class PersonService {
    private final Map<Integer, Person> people = new HashMap<>();
    private final AtomicInteger idCounter = new AtomicInteger();

    private final LinkedListStack<Operation> undoStack = new LinkedListStack<>();
    private final LinkedListStack<Operation> redoStack = new LinkedListStack<>();

    public List<Person> getAllPeople() {
        return new ArrayList<>(people.values());
    }

    public Person createPerson(String name, String role, int totalWorkHour) {
        int newId = idCounter.incrementAndGet();
        Person newPerson = new Person(newId, name, role, totalWorkHour);
        people.put(newId, newPerson);
        
        undoStack.push(new Operation(Operation.Type.CREATE, null, newPerson));
        // Correctly clear the redo stack after a new action
        while (!redoStack.isEmpty()) {
            redoStack.pop();
        }
        return newPerson;
    }

    public boolean deletePerson(int id) {
        Person personToRemove = people.get(id);
        if (personToRemove != null) {
            people.remove(id);
            undoStack.push(new Operation(Operation.Type.DELETE, personToRemove, null));
            // Correctly clear the redo stack after a new action
            while (!redoStack.isEmpty()) {
                redoStack.pop();
            }
            return true;
        }
        return false;
    }

    public Person updatePerson(int id, String name, String role, int totalWorkHour) {
        Person personToUpdate = people.get(id);
        if (personToUpdate != null) {
            Person beforeState = new Person(personToUpdate.getId(), personToUpdate.getName(), personToUpdate.getRole(), personToUpdate.getTotalWorkHour());
            personToUpdate.setName(name);
            personToUpdate.setRole(role);
            personToUpdate.setTotalWorkHour(totalWorkHour);
            
            undoStack.push(new Operation(Operation.Type.UPDATE, beforeState, personToUpdate));
            // Correctly clear the redo stack after a new action
            while (!redoStack.isEmpty()) {
                redoStack.pop();
            }
            return personToUpdate;
        }
        return null;
    }

    public Person undo() {
        if (undoStack.isEmpty()) {
            return null;
        }
        Operation lastOp = undoStack.pop();
        redoStack.push(lastOp);
        
        switch (lastOp.getType()) {
            case CREATE:
                people.remove(lastOp.getAfterState().getId());
                return null;
            case UPDATE:
                people.put(lastOp.getBeforeState().getId(), lastOp.getBeforeState());
                return lastOp.getBeforeState();
            case DELETE:
                people.put(lastOp.getBeforeState().getId(), lastOp.getBeforeState());
                return lastOp.getBeforeState();
        }
        return null;
    }

    public Person redo() {
        if (redoStack.isEmpty()) {
            return null;
        }
        Operation lastOp = redoStack.pop();
        undoStack.push(lastOp);
        
        switch (lastOp.getType()) {
            case CREATE:
                people.put(lastOp.getAfterState().getId(), lastOp.getAfterState());
                return lastOp.getAfterState();
            case UPDATE:
                people.put(lastOp.getAfterState().getId(), lastOp.getAfterState());
                return lastOp.getAfterState();
            case DELETE:
                people.remove(lastOp.getBeforeState().getId());
                return null;
        }
        return null;
    }

    // Existing methods (getPeopleSortedByWorkHours, quickSort, partition, etc.)
    public List<Person> getPeopleSortedByWorkHours() {
        List<Person> personList = new ArrayList<>(people.values());
        if (personList.size() > 1) {
            quickSort(personList, 0, personList.size() - 1);
        }
        return personList;
    }

    private void quickSort(List<Person> list, int low, int high) {
        if (low < high) {
            int pi = partition(list, low, high);
            quickSort(list, low, pi - 1);
            quickSort(list, pi + 1, high);
        }
    }

    private int partition(List<Person> list, int low, int high) {
        int pivot = list.get(high).getTotalWorkHour();
        int i = (low - 1);
        for (int j = low; j < high; j++) {
            if (list.get(j).getTotalWorkHour() <= pivot) {
                i++;
                Collections.swap(list, i, j);
            }
        }
        Collections.swap(list, i + 1, high);
        return i + 1;
    }

    public List<Person> findPeopleInWorkHourRange(int minHours, int maxHours) {
        List<Person> personList = new ArrayList<>(people.values());
        personList.sort(Comparator.comparingInt(Person::getTotalWorkHour));
        int startIndex = findFirstIndex(personList, minHours);
        int endIndex = findLastIndex(personList, maxHours);
        if (startIndex != -1 && endIndex != -1 && startIndex <= endIndex) {
            return personList.subList(startIndex, endIndex + 1);
        }
        return Collections.emptyList();
    }
    
    private int findFirstIndex(List<Person> list, int target) {
        int low = 0, high = list.size() - 1, result = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midValue = list.get(mid).getTotalWorkHour();
            if (midValue >= target) {
                result = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return result;
    }

    private int findLastIndex(List<Person> list, int target) {
        int low = 0, high = list.size() - 1, result = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midValue = list.get(mid).getTotalWorkHour();
            if (midValue <= target) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return result;
    }
}