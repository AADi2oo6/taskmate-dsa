package com.taskmate.dsaprojectbackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/arraylist/people")
public class PersonArrayListController {

    private final PersonArrayListService personArrayListService;

    public PersonArrayListController(PersonArrayListService service) {
        this.personArrayListService = service;
    }

    @GetMapping
    public List<Person> getAllPeople() {
        return personArrayListService.getAllPeople();
    }

    @PostMapping
    public Person createPerson(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String role = payload.get("role");
        int totalWorkHour = Integer.parseInt(payload.get("totalWorkHour"));

        return personArrayListService.createPerson(name, role, totalWorkHour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable int id) {
        boolean deleted = personArrayListService.deletePerson(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Person> updatePerson(@PathVariable int id, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String role = (String) payload.get("role");
        int totalWorkHour = (Integer) payload.get("totalWorkHour");

        Person updated = personArrayListService.updatePerson(id, name, role, totalWorkHour);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
