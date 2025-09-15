package com.taskmate.dsaprojectbackend;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/people")
public class PersonController {

    private final PersonService personService;

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

        return personService.createPerson(name, role, totalWorkHour);
    }
    
    // NEW METHOD FOR BULK UPLOAD
    @PostMapping("/bulk")
    public List<Person> createPeople(@RequestBody List<Map<String, Object>> payloads) {
        List<Person> newPeople = new ArrayList<>();
        for (Map<String, Object> payload : payloads) {
            String name = (String) payload.get("name");
            String role = (String) payload.get("role");
            int totalWorkHour = (Integer) payload.get("totalWorkHour");
            newPeople.add(personService.createPerson(name, role, totalWorkHour));
        }
        return newPeople;
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
    public ResponseEntity<Person> updatePerson(@PathVariable int id, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String role = (String) payload.get("role");
        int totalWorkHour = (Integer) payload.get("totalWorkHour");

        Person updatedPerson = personService.updatePerson(id, name, role, totalWorkHour);

        if (updatedPerson != null) {
            return ResponseEntity.ok(updatedPerson);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}