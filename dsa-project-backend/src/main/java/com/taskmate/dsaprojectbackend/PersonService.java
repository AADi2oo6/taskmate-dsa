package com.taskmate.dsaprojectbackend;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service // Tells Spring that this is a service class
public class PersonService {

    // Our in-memory database using a HashMap for O(1) average time access
    private final Map<Integer, Person> people = new HashMap<>();

    // A thread-safe way to generate unique IDs
    private final AtomicInteger idCounter = new AtomicInteger();

    public List<Person> getAllPeople() {
        return new ArrayList<>(people.values());
    }

    public Person createPerson(String name) {
        // Generate a new unique ID
        int newId = idCounter.incrementAndGet();

        // Create a new Person object
        Person newPerson = new Person(newId, name);

        // Add the new person to our HashMap
        people.put(newId, newPerson);

        return newPerson;
    }
    public boolean deletePerson(int id) {
        // The .remove() method on a HashMap returns the value that was removed,
        // or null if the key didn't exist.
        // We can use this to see if the deletion was successful.
        return people.remove(id) != null;
    }
}