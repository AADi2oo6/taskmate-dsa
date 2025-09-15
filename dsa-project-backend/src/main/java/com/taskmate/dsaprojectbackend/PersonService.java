package com.taskmate.dsaprojectbackend;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.Collections;
import java.util.Comparator;

@Service // Tells Spring that this is a service class
public class PersonService {

    // Our in-memory database using a HashMap for O(1) average time access
    private final Map<Integer, Person> people = new HashMap<>();

    // A thread-safe way to generate unique IDs
    private final AtomicInteger idCounter = new AtomicInteger();

    public List<Person> getAllPeople() {
        return new ArrayList<>(people.values());
    }

    public Person createPerson(String name,String role, int totalWorkHour) {
        // Generate a new unique ID
        int newId = idCounter.incrementAndGet();

        // Create a new Person object
        Person newPerson = new Person(newId, name,role,totalWorkHour);

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
    // Add this method inside PersonService.java
    public Person updatePerson(int id, String name, String role, int totalWorkHour) {
        // Find the existing person in the HashMap
        Person personToUpdate = people.get(id);

        // If the person exists, update their fields
        if (personToUpdate != null) {
            personToUpdate.setName(name);
            personToUpdate.setRole(role);
            // Assuming your Person model has a settotalWorkHour method
            personToUpdate.setTotalWorkHour(totalWorkHour);
            return personToUpdate;
        }
        // Return null or throw an exception if the person wasn't found
        return null;
    }


    // Adding sorting method in the services
    public List<Person> getPeopleSortedByWorkHours() {
        // 1. Get the data from the HashMap and convert it to a List
        List<Person> personList = new ArrayList<>(people.values());

        // 2. Perform the in-place sort on the list
        if (personList.size() > 1) {
            quickSort(personList, 0, personList.size() - 1);
        }

        // 3. Return the now-sorted list
        return personList;
    }
    private void quickSort(List<Person> list, int low, int high) {
        if (low < high) {
            // pi is the partitioning index, arr[pi] is now at the right place
            int pi = partition(list, low, high);

            // Recursively sort elements before and after partition
            quickSort(list, low, pi - 1);
            quickSort(list, pi + 1, high);
        }
    }
    private int partition(List<Person> list, int low, int high) {
        // Choose the pivot (last element)
        int pivot = list.get(high).getTotalWorkHour();

        // Index of the smaller element
        int i = (low - 1);

        for (int j = low; j < high; j++) {
            // If the current element's work hour is smaller than or equal to the pivot
            if (list.get(j).getTotalWorkHour() <= pivot) {
                i++;
                // Swap list[i] and list[j]
                Collections.swap(list, i, j);
            }
        }

        // Swap list[i+1] and list[high] (the pivot)
        Collections.swap(list, i + 1, high);

        return i + 1;
    }
    public List<Person> findPeopleInWorkHourRange(int minHours, int maxHours) {
        // 1. Get the data and, crucially, sort it by work hours.
        // This is a PRE-REQUISITE for binary search to work.
        List<Person> personList = new ArrayList<>(people.values());
        personList.sort(Comparator.comparingInt(Person::getTotalWorkHour));

        // 2. Find the starting and ending indices of our range.
        int startIndex = findFirstIndex(personList, minHours);
        int endIndex = findLastIndex(personList, maxHours);

        // 3. If the range is valid, extract and return the sublist.
        if (startIndex != -1 && endIndex != -1 && startIndex <= endIndex) {
            return personList.subList(startIndex, endIndex + 1);
        }

        // 4. If no valid range is found, return an empty list.
        return Collections.emptyList();
    }

    /**
     * A modified binary search to find the index of the FIRST element
     * that is greater than or equal to the target value.
     */
    private int findFirstIndex(List<Person> list, int target) {
        int low = 0, high = list.size() - 1, result = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midValue = list.get(mid).getTotalWorkHour();

            if (midValue >= target) {
                result = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return result;
    }

    /**
     * A modified binary search to find the index of the LAST element
     * that is less than or equal to the target value.
     */
    private int findLastIndex(List<Person> list, int target) {
        int low = 0, high = list.size() - 1, result = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midValue = list.get(mid).getTotalWorkHour();

            if (midValue <= target) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1; 
            }
        }
        return result;
    }
}