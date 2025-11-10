package com.taskmate.dsaprojectbackend.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Add this import
import org.springframework.stereotype.Repository;

import java.util.List; // <-- Add this import

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {

    // **ADD THIS METHOD**
    // This query fetches all Teams and also forces the
    // initialization of the 'members' collection in the same query.
    @Query("SELECT t FROM Team t LEFT JOIN FETCH t.members")
    List<Team> findAllWithMembers();
}