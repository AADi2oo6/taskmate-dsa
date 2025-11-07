// src/main/java/com/taskmate/dsaprojectbackend/person/PersonController.java
package com.taskmate.dsaprojectbackend.person;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    // Undo endpoint
    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undoLastOperation() {
        boolean success = personService.undoLastOperation();
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Operation undone successfully"));
        } else {
            return ResponseEntity.ok(Map.of("success", false, "message", "Nothing to undo"));
        }
    }
    
    // Redo endpoint
    @PostMapping("/redo")
    public ResponseEntity<Map<String, Object>> redoLastOperation() {
        boolean success = personService.redoLastOperation();
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Operation redone successfully"));
        } else {
            return ResponseEntity.ok(Map.of("success", false, "message", "Nothing to redo"));
        }
    }
    
    // Check if undo is available
    @GetMapping("/can-undo")
    public ResponseEntity<Map<String, Object>> canUndo() {
        boolean canUndo = personService.canUndo();
        return ResponseEntity.ok(Map.of("canUndo", canUndo));
    }
    
    // Check if redo is available
    @GetMapping("/can-redo")
    public ResponseEntity<Map<String, Object>> canRedo() {
        boolean canRedo = personService.canRedo();
        return ResponseEntity.ok(Map.of("canRedo", canRedo));
    }
}