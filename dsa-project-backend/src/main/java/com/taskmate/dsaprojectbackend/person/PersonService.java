package com.taskmate.dsaprojectbackend.person;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmate.dsaprojectbackend.common.LinkedListStack;
import com.taskmate.dsaprojectbackend.common.Operation;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final LinkedListStack<Operation> undoStack = new LinkedListStack<>();
    private final LinkedListStack<Operation> redoStack = new LinkedListStack<>();

    // Inject the PersonRepository
    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<PersonDTO> getAllPeople() {
        // Fetch all people from the database
        return personRepository.findAll().stream()
                .map(PersonDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public PersonDTO createPerson(PersonRequest personRequest) {
        Person newPerson = new Person();
        newPerson.setName(personRequest.getName());
        newPerson.setRole(personRequest.getRole());
        newPerson.setTotalWorkHour(personRequest.getTotalWorkHour());
        newPerson.setManagerId(personRequest.getManagerId());

        // Save the new person to the database
        Person savedPerson = personRepository.save(newPerson);

        // Push operation to undo stack
        undoStack.push(new Operation(Operation.Type.CREATE, null, copyPerson(savedPerson)));
        redoStack.clear();

        return new PersonDTO(savedPerson);
    }

    @Transactional
    public boolean deletePerson(int id) {
        Optional<Person> personOptional = personRepository.findById(id);
        if (personOptional.isPresent()) {
            Person personToDelete = personOptional.get();

            // Push *before* deleting
            undoStack.push(new Operation(Operation.Type.DELETE, copyPerson(personToDelete), null));
            redoStack.clear();

            // Delete from the database
            personRepository.delete(personToDelete);
            return true;
        }
        return false;
    }

    @Transactional
    public PersonDTO updatePerson(int id, PersonRequest updatedPersonData) {
        Optional<Person> personOptional = personRepository.findById(id);
        if (personOptional.isPresent()) {
            Person existingPerson = personOptional.get();

            // Save the state *before* update for undo
            Person beforeState = copyPerson(existingPerson);

            existingPerson.setName(updatedPersonData.getName());
            existingPerson.setRole(updatedPersonData.getRole());
            existingPerson.setTotalWorkHour(updatedPersonData.getTotalWorkHour());
            existingPerson.setManagerId(updatedPersonData.getManagerId());

            // Save the updated person to the database
            Person savedPerson = personRepository.save(existingPerson);

            // Push operation to undo stack
            undoStack.push(new Operation(Operation.Type.UPDATE, beforeState, copyPerson(savedPerson)));
            redoStack.clear();

            return new PersonDTO(savedPerson);
        }
        return null;
    }

    // --- UNDO / REDO ---
    // These now use the repository to apply changes

    @Transactional
    public boolean undoLastOperation() {
        if (undoStack.isEmpty()) return false;

        Operation lastOperation = undoStack.pop();
        Operation reverseOperation = null;

        switch (lastOperation.getType()) {
            case CREATE:
                // Undo create by deleting
                Person createdPerson = lastOperation.getAfterState();
                personRepository.deleteById(createdPerson.getId());
                reverseOperation = new Operation(Operation.Type.DELETE, createdPerson, null);
                break;

            case DELETE:
                // Undo delete by recreating
                Person deletedPerson = lastOperation.getBeforeState();
                // Save the recreated person (note: ID might change if not manually set)
                // It's safer to re-save without ID to avoid conflicts
                deletedPerson.setId(0); // Reset ID to force new creation
                Person recreatedPerson = personRepository.save(deletedPerson);
                reverseOperation = new Operation(Operation.Type.CREATE, null, recreatedPerson);
                break;

            case UPDATE:
                // Undo update by reverting
                Person beforeUpdate = lastOperation.getBeforeState();
                personRepository.save(beforeUpdate); // Save the 'before' state
                reverseOperation = new Operation(Operation.Type.UPDATE, lastOperation.getAfterState(), beforeUpdate);
                break;
        }

        redoStack.push(reverseOperation);
        return true;
    }

    @Transactional
    public boolean redoLastOperation() {
        if (redoStack.isEmpty()) return false;

        Operation lastUndoneOperation = redoStack.pop();
        Operation reverseOperation = null;

        switch (lastUndoneOperation.getType()) {
            case CREATE:
                // Redo create
                Person personToCreate = lastUndoneOperation.getAfterState();
                personToCreate.setId(0); // Force new creation
                Person recreatedPerson = personRepository.save(personToCreate);
                reverseOperation = new Operation(Operation.Type.CREATE, null, recreatedPerson);
                break;

            case DELETE:
                // Redo delete
                Person personToDelete = lastUndoneOperation.getBeforeState();
                personRepository.deleteById(personToDelete.getId());
                reverseOperation = new Operation(Operation.Type.DELETE, personToDelete, null);
                break;

            case UPDATE:
                // Redo update
                Person personToUpdate = lastUndoneOperation.getAfterState();
                personRepository.save(personToUpdate);
                reverseOperation = new Operation(Operation.Type.UPDATE, lastUndoneOperation.getBeforeState(), personToUpdate);
                break;
        }

        undoStack.push(reverseOperation);
        return true;
    }

    // --- Helper and Other Methods ---

    public List<PersonDTO> getPeopleSortedByWorkHours() {
        // You can implement this with a custom query in PersonRepository
        // For now, it fetches all and sorts in memory
        return personRepository.findAll().stream()
                .sorted((p1, p2) -> Integer.compare(p1.getTotalWorkHour(), p2.getTotalWorkHour()))
                .map(PersonDTO::new)
                .collect(Collectors.toList());
    }

    public List<PersonDTO> findPeopleInWorkHourRange(int minHours, int maxHours) {
        // This is a great candidate for a @Query in PersonRepository
        return personRepository.findAll().stream()
                .filter(p -> p.getTotalWorkHour() >= minHours && p.getTotalWorkHour() <= maxHours)
                .map(PersonDTO::new)
                .collect(Collectors.toList());
    }

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

    public boolean canUndo() {
        return !undoStack.isEmpty();
    }

    public boolean canRedo() {
        return !redoStack.isEmpty();
    }
}