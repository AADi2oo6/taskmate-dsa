// src/main/java/com/taskmate/dsaprojectbackend/person/PersonService.java
package com.taskmate.dsaprojectbackend.person;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.taskmate.dsaprojectbackend.common.LinkedListStack;
import com.taskmate.dsaprojectbackend.common.Operation;

@Service
public class PersonService {
    private final String CSV_FILE_PATH = Paths.get("people_data.csv").toAbsolutePath().toString();
    private final LinkedListStack<Operation> undoStack = new LinkedListStack<>();
    private final LinkedListStack<Operation> redoStack = new LinkedListStack<>();
    private final AtomicInteger idCounter = new AtomicInteger(1);
    private List<Person> peopleList = new ArrayList<>();

    public PersonService() {
        loadPeopleFromCSV();
    }

    // Load people data from CSV file
    private void loadPeopleFromCSV() {
        peopleList.clear();
        try (BufferedReader br = new BufferedReader(new FileReader(CSV_FILE_PATH))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }
                
                String[] values = line.split(",");
                if (values.length >= 3) {
                    Person person = new Person();
                    person.setId(idCounter.getAndIncrement());
                    person.setName(values[0].trim());
                    person.setRole(values[1].trim());
                    person.setTotalWorkHour(Integer.parseInt(values[2].trim()));
                    peopleList.add(person);
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.out.println("Could not load CSV file, starting with empty list: " + e.getMessage());
            // Initialize with some default data if file doesn't exist
            initializeDefaultData();
        }
    }

    // Initialize with default data if CSV file doesn't exist
    private void initializeDefaultData() {
        // Add some sample data
        Person person1 = new Person();
        person1.setId(idCounter.getAndIncrement());
        person1.setName("John Doe");
        person1.setRole("Developer");
        person1.setTotalWorkHour(180);
        peopleList.add(person1);
        
        Person person2 = new Person();
        person2.setId(idCounter.getAndIncrement());
        person2.setName("Jane Smith");
        person2.setRole("Manager");
        person2.setTotalWorkHour(190);
        peopleList.add(person2);
        
        // Save to CSV
        savePeopleToCSV();
    }

    // Save people data to CSV file
    private void savePeopleToCSV() {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(CSV_FILE_PATH))) {
            // Write header
            bw.write("personName,role,TotalWorkingHour");
            bw.newLine();
            
            // Write data
            for (Person person : peopleList) {
                bw.write(person.getName() + "," + person.getRole() + "," + person.getTotalWorkHour());
                bw.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<PersonDTO> getAllPeople() {
        return peopleList.stream()
                .map(PersonDTO::new)
                .collect(Collectors.toList());
    }

    public PersonDTO createPerson(PersonRequest personRequest) {
        Person newPerson = new Person();
        newPerson.setId(idCounter.getAndIncrement());
        newPerson.setName(personRequest.getName());
        newPerson.setRole(personRequest.getRole());
        newPerson.setTotalWorkHour(personRequest.getTotalWorkHour());
        newPerson.setManagerId(personRequest.getManagerId());

        peopleList.add(newPerson);
        savePeopleToCSV();
        
        // Push operation to undo stack
        undoStack.push(new Operation(Operation.Type.CREATE, null, copyPerson(newPerson)));
        // Clear redo stack when new operation is performed
        redoStack.clear();
        
        return new PersonDTO(newPerson);
    }

    public boolean deletePerson(int id) {
        Person personToDelete = null;
        int index = -1;
        
        for (int i = 0; i < peopleList.size(); i++) {
            if (peopleList.get(i).getId() == id) {
                personToDelete = peopleList.get(i);
                index = i;
                break;
            }
        }
        
        if (personToDelete != null) {
            peopleList.remove(index);
            savePeopleToCSV();
            
            // Push operation to undo stack
            undoStack.push(new Operation(Operation.Type.DELETE, copyPerson(personToDelete), null));
            // Clear redo stack when new operation is performed
            redoStack.clear();
            
            return true;
        }
        return false;
    }

    public PersonDTO updatePerson(int id, PersonRequest updatedPersonData) {
        for (int i = 0; i < peopleList.size(); i++) {
            Person existingPerson = peopleList.get(i);
            if (existingPerson.getId() == id) {
                // Save the state before update for undo operation
                Person beforeState = copyPerson(existingPerson);

                existingPerson.setName(updatedPersonData.getName());
                existingPerson.setRole(updatedPersonData.getRole());
                existingPerson.setTotalWorkHour(updatedPersonData.getTotalWorkHour());
                existingPerson.setManagerId(updatedPersonData.getManagerId());

                savePeopleToCSV();
                
                // Push operation to undo stack
                undoStack.push(new Operation(Operation.Type.UPDATE, beforeState, copyPerson(existingPerson)));
                // Clear redo stack when new operation is performed
                redoStack.clear();

                return new PersonDTO(existingPerson);
            }
        }
        return null;
    }

    // Undo the last operation
    public boolean undoLastOperation() {
        if (undoStack.isEmpty()) {
            return false; // Nothing to undo
        }
        
        Operation lastOperation = undoStack.pop();
        Operation reverseOperation = null;
        
        switch (lastOperation.getType()) {
            case CREATE:
                // Undo create by deleting the person
                Person createdPerson = lastOperation.getAfterState();
                peopleList.removeIf(p -> p.getId() == createdPerson.getId());
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.DELETE, createdPerson, null);
                break;
                
            case DELETE:
                // Undo delete by recreating the person
                Person deletedPerson = lastOperation.getBeforeState();
                peopleList.add(deletedPerson);
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.CREATE, null, deletedPerson);
                break;
                
            case UPDATE:
                // Undo update by reverting to the previous state
                Person beforeUpdate = lastOperation.getBeforeState();
                Person afterUpdate = lastOperation.getAfterState();
                
                for (int i = 0; i < peopleList.size(); i++) {
                    Person person = peopleList.get(i);
                    if (person.getId() == afterUpdate.getId()) {
                        peopleList.set(i, copyPerson(beforeUpdate));
                        break;
                    }
                }
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.UPDATE, afterUpdate, beforeUpdate);
                break;
        }
        
        if (reverseOperation != null) {
            redoStack.push(reverseOperation);
            return true;
        }
        
        return false;
    }
    
    // Redo the last undone operation
    public boolean redoLastOperation() {
        if (redoStack.isEmpty()) {
            return false; // Nothing to redo
        }
        
        Operation lastUndoneOperation = redoStack.pop();
        Operation reverseOperation = null;
        
        switch (lastUndoneOperation.getType()) {
            case CREATE:
                // Redo create by recreating the person
                Person createdPerson = lastUndoneOperation.getAfterState();
                peopleList.add(createdPerson);
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.CREATE, null, createdPerson);
                break;
                
            case DELETE:
                // Redo delete by deleting the person
                Person deletedPerson = lastUndoneOperation.getBeforeState();
                peopleList.removeIf(p -> p.getId() == deletedPerson.getId());
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.DELETE, deletedPerson, null);
                break;
                
            case UPDATE:
                // Redo update by applying the update again
                Person beforeUpdate = lastUndoneOperation.getBeforeState();
                Person afterUpdate = lastUndoneOperation.getAfterState();
                
                for (int i = 0; i < peopleList.size(); i++) {
                    Person person = peopleList.get(i);
                    if (person.getId() == beforeUpdate.getId()) {
                        peopleList.set(i, copyPerson(afterUpdate));
                        break;
                    }
                }
                savePeopleToCSV();
                reverseOperation = new Operation(Operation.Type.UPDATE, beforeUpdate, afterUpdate);
                break;
        }
        
        if (reverseOperation != null) {
            undoStack.push(reverseOperation);
            return true;
        }
        
        return false;
    }
    
    // Helper method to create a copy of a Person object
    private Person copyPerson(Person person) {
        if (person == null) return null;
        
        Person copy = new Person();
        copy.setId(person.getId());
        copy.setName(person.getName());
        copy.setRole(person.getRole());
        copy.setTotalWorkHour(person.getTotalWorkHour());
        copy.setManagerId(person.getManagerId());
        return copy;
    }

    public List<PersonDTO> getPeopleSortedByWorkHours() {
        List<Person> sortedPeople = new ArrayList<>(peopleList);
        sortedPeople.sort(Comparator.comparingInt(Person::getTotalWorkHour));
        return sortedPeople.stream().map(PersonDTO::new).collect(Collectors.toList());
    }

    public List<PersonDTO> findPeopleInWorkHourRange(int minHours, int maxHours) {
        List<Person> result = new ArrayList<>();
        for (Person person : peopleList) {
            if (person.getTotalWorkHour() >= minHours && person.getTotalWorkHour() <= maxHours) {
                result.add(person);
            }
        }
        return result.stream().map(PersonDTO::new).collect(Collectors.toList());
    }
    
    // Methods to check if undo/redo operations are available
    public boolean canUndo() {
        return !undoStack.isEmpty();
    }
    
    public boolean canRedo() {
        return !redoStack.isEmpty();
    }
}