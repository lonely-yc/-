package com.aipm.backend.controller;

import com.aipm.backend.dto.ProjectInsight;
import com.aipm.backend.entity.Project;
import com.aipm.backend.entity.ProjectMember;
import com.aipm.backend.service.ProjectService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public Map<String, Object> list() {
        return ApiResponse.ok(projectService.findAll());
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable Long id) {
        return ApiResponse.ok(Map.of(
                "project", projectService.findById(id),
                "members", projectService.getMembers(id),
                "insight", projectService.getInsight(id)
        ));
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Project project) {
        return ApiResponse.ok("创建成功", projectService.create(project));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Project project) {
        project.setId(id);
        projectService.update(project);
        return ApiResponse.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ApiResponse.ok("删除成功");
    }

    @GetMapping("/{id}/members")
    public Map<String, Object> members(@PathVariable Long id) {
        return ApiResponse.ok(projectService.getMembers(id));
    }

    @PostMapping("/{id}/members")
    public Map<String, Object> addMember(@PathVariable Long id, @RequestBody ProjectMember member) {
        member.setProjectId(id);
        projectService.addMember(member);
        return ApiResponse.ok("添加成功");
    }

    @PutMapping("/{id}/members")
    public Map<String, Object> saveMembers(@PathVariable Long id, @RequestBody List<ProjectMember> members) {
        projectService.saveMembers(id, members);
        return ApiResponse.ok("保存成功");
    }

    @GetMapping("/{id}/insight")
    public Map<String, Object> insight(@PathVariable Long id) {
        return ApiResponse.ok(projectService.getInsight(id));
    }

    @PutMapping("/{id}/insight")
    public Map<String, Object> saveInsight(@PathVariable Long id, @RequestBody ProjectInsight insight) {
        return ApiResponse.ok("保存成功", projectService.saveInsight(id, insight));
    }
}
