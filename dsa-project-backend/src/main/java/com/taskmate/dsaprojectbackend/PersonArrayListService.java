package com.taskmate.dsaprojectbackend;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class PersonArrayListService {

    private final List<Person> people = new ArrayList<>();
    private final AtomicInteger idCounter = new AtomicInteger();

    // Get all people
    public List<Person> getAllPeople() {
        return new ArrayList<>(people); // return a copy
    }

    // Create person
    public Person createPerson(String name, String role, int totalWorkHour) {
        int newId = idCounter.incrementAndGet();
        Person newPerson = new Person(newId, name, role, totalWorkHour);
        people.add(newPerson); // ArrayList add
        return newPerson;
    }

    // Delete person
    public boolean deletePerson(int id) {
        return people.removeIf(p -> p.getId() == id); // O(n) search + remove
    }

    // Update person
    public Person updatePerson(int id, String name, String role, int totalWorkHour) {
        for (Person p : people) {
            if (p.getId() == id) {
                p.setName(name);
                p.setRole(role);
                p.setTotalWorkHour(totalWorkHour);
                return p;
            }
        }
        return null;
    }
}
