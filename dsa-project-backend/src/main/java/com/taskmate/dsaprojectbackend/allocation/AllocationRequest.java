package com.taskmate.dsaprojectbackend.allocation;

import java.time.LocalDateTime;
import java.util.List;

public class AllocationRequest {
    private int resourceId;
    private int responsiblePersonId;
    private String sprintName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Integer> teamIds;
    private List<Integer> taskIds;

    // Getters and Setters
    public int getResourceId() { return resourceId; }
    public void setResourceId(int resourceId) { this.resourceId = resourceId; }

    public int getResponsiblePersonId() { return responsiblePersonId; }
    public void setResponsiblePersonId(int responsiblePersonId) { this.responsiblePersonId = responsiblePersonId; }

    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public List<Integer> getTeamIds() { return teamIds; }
    public void setTeamIds(List<Integer> teamIds) { this.teamIds = teamIds; }

    public List<Integer> getTaskIds() { return taskIds; }
    public void setTaskIds(List<Integer> taskIds) { this.taskIds = taskIds; }
}
