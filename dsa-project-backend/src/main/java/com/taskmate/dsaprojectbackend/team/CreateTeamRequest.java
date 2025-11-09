package com.taskmate.dsaprojectbackend.team;

public class CreateTeamRequest {
    private String teamName;
    private Integer leadId;
    private String memberIds; // Changed from List<Integer> to String

    // Getters
    public String getTeamName() {
        return teamName;
    }

    public Integer getLeadId() {
        return leadId;
    }

    public String getMemberIds() {
        return memberIds;
    }

    // Setters
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setLeadId(Integer leadId) {
        this.leadId = leadId;
    }

    public void setMemberIds(String memberIds) {
        this.memberIds = memberIds;
    }
}