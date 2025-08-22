package com.taskmate.dsaprojectbackend;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/people") // Base path for all methods in this controller
public class PersonController {

    private final PersonService personService;

    // Spring uses Dependency Injection to provide an instance of PersonService
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    public List<Person> getAllPeople() {
        return personService.getAllPeople();
    }

    @PostMapping
    public Person createPerson(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        return personService.createPerson(name);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable int id) {
        boolean wasDeleted = personService.deletePerson(id);
        if (wasDeleted) {
            // HTTP 204 No Content is a standard success response for a DELETE operation
            return ResponseEntity.noContent().build();
        } else {
            // HTTP 404 Not Found is appropriate if the person doesn't exist
            return ResponseEntity.notFound().build();
        }
    }
}