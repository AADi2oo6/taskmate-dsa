package com.taskmate.dsaprojectbackend.team;

import java.util.List;

public class CreateTeamRequest {
    private String teamName;
    private Integer leadId;
    private List<Integer> memberIds; // ✅ FIX: should be a list, not a string

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Integer getLeadId() {
        return leadId;
    }

    public void setLeadId(Integer leadId) {
        this.leadId = leadId;
    }

    public List<Integer> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(List<Integer> memberIds) {
        this.memberIds = memberIds;
    }
}
