package com.aipm.backend.service.impl;

import com.aipm.backend.dto.ProjectInsight;
import com.aipm.backend.entity.Person;
import com.aipm.backend.entity.Project;
import com.aipm.backend.entity.ProjectMember;
import com.aipm.backend.mapper.PersonMapper;
import com.aipm.backend.mapper.ProjectMapper;
import com.aipm.backend.mapper.ProjectMemberMapper;
import com.aipm.backend.service.OperationLogService;
import com.aipm.backend.service.ProjectInsightService;
import com.aipm.backend.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {
    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper memberMapper;
    private final PersonMapper personMapper;
    private final ProjectInsightService insightService;
    private final OperationLogService operationLogService;

    public ProjectServiceImpl(
            ProjectMapper projectMapper,
            ProjectMemberMapper memberMapper,
            PersonMapper personMapper,
            ProjectInsightService insightService,
            OperationLogService operationLogService
    ) {
        this.projectMapper = projectMapper;
        this.memberMapper = memberMapper;
        this.personMapper = personMapper;
        this.insightService = insightService;
        this.operationLogService = operationLogService;
    }

    @Override
    public List<Project> findAll() {
        return projectMapper.findAll();
    }

    @Override
    public Project findById(Long id) {
        return projectMapper.findById(id);
    }

    @Override
    public Project create(Project project) {
        projectMapper.insert(project);
        operationLogService.record(project.getId(), project.getName(), project.getManager(), "project_create", "新增项目", project.getDescription());
        return project;
    }

    @Override
    public int update(Project project) {
        int count = projectMapper.update(project);
        operationLogService.record(project.getId(), project.getName(), project.getManager(), "project_update", "更新项目", project.getDescription());
        return count;
    }

    @Override
    @Transactional
    public int delete(Long id) {
        Project project = projectMapper.findById(id);
        insightService.deleteByProjectId(id);
        memberMapper.deleteByProjectId(id);
        int count = projectMapper.delete(id);
        operationLogService.record(
                id,
                project == null ? null : project.getName(),
                project == null ? null : project.getManager(),
                "project_delete",
                "删除项目",
                "项目、关联成员和追踪记录已删除"
        );
        return count;
    }

    @Override
    public List<ProjectMember> getMembers(Long projectId) {
        return memberMapper.findByProjectId(projectId);
    }

    @Override
    public int addMember(ProjectMember member) {
        fillMemberRole(member);
        int count = memberMapper.insert(member);
        Project project = projectMapper.findById(member.getProjectId());
        Person person = personMapper.findById(member.getUserId());
        operationLogService.record(
                member.getProjectId(),
                project == null ? null : project.getName(),
                person == null ? null : person.getRealName(),
                "member_add",
                "添加项目成员",
                person == null ? null : person.getRealName() + "加入项目"
        );
        return count;
    }

    @Override
    @Transactional
    public int saveMembers(Long projectId, List<ProjectMember> members) {
        memberMapper.deleteByProjectId(projectId);
        int count = 0;
        for (ProjectMember member : members) {
            member.setProjectId(projectId);
            fillMemberRole(member);
            count += memberMapper.insert(member);
        }
        return count;
    }

    @Override
    public ProjectInsight getInsight(Long projectId) {
        return insightService.getByProjectId(projectId);
    }

    @Override
    public ProjectInsight saveInsight(Long projectId, ProjectInsight insight) {
        return insightService.save(projectId, insight);
    }

    private void fillMemberRole(ProjectMember member) {
        if (member.getRole() != null && !member.getRole().isBlank()) {
            return;
        }
        Person person = personMapper.findById(member.getUserId());
        if (person != null) {
            member.setRole(person.getRole());
        }
    }
}
