package com.taskmate.dsaprojectbackend;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

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
        String role = payload.get("role");
        int totalWorkHour = Integer.parseInt(payload.get("totalWorkHour"));

        return personService.createPerson(name,role,totalWorkHour);
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
    @PutMapping("/{id}")
    public ResponseEntity<Person> updatePerson(@PathVariable int id, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String role = (String) payload.get("role");
        // Spring converts the JSON number to an Integer automatically
        int totalWorkHour = (Integer) payload.get("totalWorkHour");

        Person updatedPerson = personService.updatePerson(id, name, role, totalWorkHour);

        if (updatedPerson != null) {
            return ResponseEntity.ok(updatedPerson);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
//    Sorting
    @GetMapping("/sorted-by-hours")
    public List<Person> getSortedPeople() {
        return personService.getPeopleSortedByWorkHours();
    }

//    Binary Search
    @GetMapping("/search-by-hours")
    public List<Person> searchPeopleByWorkHours(
            @RequestParam int min,
            @RequestParam int max) {
        return personService.findPeopleInWorkHourRange(min, max);
    }
}