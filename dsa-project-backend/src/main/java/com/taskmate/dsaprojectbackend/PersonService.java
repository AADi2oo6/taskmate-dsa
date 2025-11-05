// src/main/java/com/taskmate/dsaprojectbackend/PersonService.java
package com.taskmate.dsaprojectbackend;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PersonService {
    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<PersonDTO> getAllPeople() {
        // Convert Person entities to PersonDTOs to safely expose team data
        return personRepository.findAll().stream()
                .map(PersonDTO::new)
                .collect(Collectors.toList());
    }

    // This new method accepts a Person object, which matches the frontend request
    public PersonDTO createPerson(PersonRequest personRequest) {
        Person newPerson = new Person();
        newPerson.setName(personRequest.getName());
        newPerson.setRole(personRequest.getRole());
        newPerson.setTotalWorkHour(personRequest.getTotalWorkHour());

        if (personRequest.getManagerId() != null) {
            newPerson.setManagerId(personRequest.getManagerId());
        }

        return new PersonDTO(personRepository.save(newPerson));
    }

    public PersonDTO createPersonAndConvertToDTO(Person person) {
        Person savedPerson = personRepository.save(person);
        return new PersonDTO(savedPerson);
    }

    public boolean deletePerson(int id) {
        if(personRepository.existsById(id)) {
            personRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // New method to update a person using a Person object
    public PersonDTO updatePerson(int id, PersonRequest updatedPersonData) {
        Optional<Person> existingPersonOptional = personRepository.findById(id);
        if (existingPersonOptional.isPresent()) {
            Person existingPerson = existingPersonOptional.get();

            existingPerson.setName(updatedPersonData.getName());
            existingPerson.setRole(updatedPersonData.getRole());
            existingPerson.setTotalWorkHour(updatedPersonData.getTotalWorkHour());

            Integer managerId = updatedPersonData.getManagerId();
            existingPerson.setManagerId(managerId);

            Person updatedPerson = personRepository.save(existingPerson);

            return new PersonDTO(updatedPerson);
        }
        return null;
    }

    // Existing methods (getPeopleSortedByWorkHours, quickSort, partition, etc.)
    public List<PersonDTO> getPeopleSortedByWorkHours() {
        List<Person> people = personRepository.findAll();
        people.sort(Comparator.comparingInt(Person::getTotalWorkHour));
        return people.stream().map(PersonDTO::new).collect(Collectors.toList());
    }

    public List<PersonDTO> findPeopleInWorkHourRange(int minHours, int maxHours) {
        List<Person> people = personRepository.findAll();
        // This is a simplified linear search. For a large dataset, a binary search on a sorted list would be better.
        List<Person> result = new ArrayList<>();
        for (Person person : people) {
            if (person.getTotalWorkHour() >= minHours && person.getTotalWorkHour() <= maxHours) {
                result.add(person);
            }
        }
        return result.stream().map(PersonDTO::new).collect(Collectors.toList());
    }

    // New method to build the organizational hierarchy as a tree
    public List<TreeNode<Person>> buildOrganizationTree() {
        Map<Integer, TreeNode<Person>> nodeMap = new HashMap<>();
        List<TreeNode<Person>> rootNodes = new ArrayList<>();

        // Create all nodes
        for (Person person : personRepository.findAll()) {
            nodeMap.put(person.getId(), new TreeNode<>(person));
        }

        // Build hierarchy
        for (Person person : personRepository.findAll()) {
            TreeNode<Person> personNode = nodeMap.get(person.getId());            if (person.getManagerId() != null && nodeMap.containsKey(person.getManagerId())) {
                TreeNode<Person> managerNode = nodeMap.get(person.getManagerId());
                managerNode.addChild(personNode);
            } else {
                // If no manager or manager not found, it's a root node
                rootNodes.add(personNode);
            }
        }

        // Sort root nodes and their children for consistent display (optional)
        rootNodes.sort(Comparator.comparing(node -> node.getData().getName()));
        // You might want to sort children as well recursively

        return rootNodes;
    }
}