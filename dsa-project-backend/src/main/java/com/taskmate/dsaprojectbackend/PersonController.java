// src/main/java/com/taskmate/dsaprojectbackend/PersonController.java
package com.taskmate.dsaprojectbackend;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/people")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    public List<PersonDTO> getAllPeople() {
        return personService.getAllPeople();
    }

    @PostMapping
    public PersonDTO createPerson(@RequestBody PersonRequest personRequest) {
        return personService.createPerson(personRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable int id) {
        boolean wasDeleted = personService.deletePerson(id);
        if (wasDeleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonDTO> updatePerson(@PathVariable int id, @RequestBody PersonRequest personRequest) {
        PersonDTO updatedPerson = personService.updatePerson(id, personRequest);
        if (updatedPerson != null) { 
            return ResponseEntity.ok(updatedPerson);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sorted-by-hours")
    public List<PersonDTO> getSortedPeople() {
        return personService.getPeopleSortedByWorkHours();
    }

    @GetMapping("/search-by-hours")
    public List<PersonDTO> searchPeopleByWorkHours(
            @RequestParam int min,
            @RequestParam int max) {
        return personService.findPeopleInWorkHourRange(min, max);
    }

    // New endpoint to get the organizational hierarchy as a tree
    @GetMapping("/hierarchy")
    public List<TreeNode<Person>> getOrganizationHierarchy() {
        return personService.buildOrganizationTree();
    }

    /**
     * Exception handler for database integrity issues (e.g., unique constraints).
     * This provides specific error feedback to the frontend.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        // Log the full error on the backend for debugging
        System.err.println("ADD/UPDATE PERSON FAILED: " + ex.getMessage());
        // Send a user-friendly error message to the frontend
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A person with similar details might already exist, or required data is missing."));
    }
}