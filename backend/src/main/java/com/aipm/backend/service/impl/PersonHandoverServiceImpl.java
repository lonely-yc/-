package com.aipm.backend.service.impl;

import com.aipm.backend.dto.PersonProjectHandover;
import com.aipm.backend.entity.Person;
import com.aipm.backend.entity.PersonHandoverDocument;
import com.aipm.backend.entity.PersonProjectHandoverRecord;
import com.aipm.backend.entity.Project;
import com.aipm.backend.entity.ProjectMember;
import com.aipm.backend.mapper.PersonHandoverDocumentMapper;
import com.aipm.backend.mapper.PersonMapper;
import com.aipm.backend.mapper.PersonProjectHandoverMapper;
import com.aipm.backend.mapper.ProjectMapper;
import com.aipm.backend.mapper.ProjectMemberMapper;
import com.aipm.backend.service.PersonHandoverService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class PersonHandoverServiceImpl implements PersonHandoverService {
    private final PersonMapper personMapper;
    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final PersonProjectHandoverMapper handoverMapper;
    private final PersonHandoverDocumentMapper documentMapper;

    public PersonHandoverServiceImpl(
            PersonMapper personMapper,
            ProjectMapper projectMapper,
            ProjectMemberMapper projectMemberMapper,
            PersonProjectHandoverMapper handoverMapper,
            PersonHandoverDocumentMapper documentMapper
    ) {
        this.personMapper = personMapper;
        this.projectMapper = projectMapper;
        this.projectMemberMapper = projectMemberMapper;
        this.handoverMapper = handoverMapper;
        this.documentMapper = documentMapper;
    }

    @Override
    public PersonProjectHandover getPersonProjectHandover(Long personId) {
        PersonProjectHandover response = new PersonProjectHandover();
        response.setPerson(personMapper.findById(personId));

        List<PersonProjectHandover.ProjectCard> cards = projectMemberMapper.findByUserId(personId).stream()
                .map(member -> buildProjectCard(personId, member))
                .filter(Objects::nonNull)
                .sorted(projectCardComparator())
                .toList();
        response.setProjects(cards);
        return response;
    }

    @Override
    public PersonProjectHandoverRecord saveHandover(Long personId, Long projectId, PersonProjectHandoverRecord record) {
        record.setPersonId(personId);
        record.setProjectId(projectId);
        if (record.getHandoverStatus() == null || record.getHandoverStatus().isBlank()) {
            record.setHandoverStatus("未交接");
        }
        if (record.getHandoverAt() == null) {
            record.setHandoverAt(LocalDateTime.now());
        }
        handoverMapper.upsert(record);
        PersonProjectHandoverRecord saved = handoverMapper.findOne(personId, projectId);
        return saved == null ? record : saved;
    }

    @Override
    public PersonHandoverDocument addDocument(Long personId, Long projectId, PersonHandoverDocument document) {
        document.setPersonId(personId);
        document.setProjectId(projectId);
        if (document.getUploadedAt() == null) {
            document.setUploadedAt(LocalDateTime.now());
        }
        documentMapper.insert(document);
        return document;
    }

    @Override
    public void deleteDocument(Long documentId) {
        documentMapper.delete(documentId);
    }

    private PersonProjectHandover.ProjectCard buildProjectCard(Long personId, ProjectMember member) {
        Project project = projectMapper.findById(member.getProjectId());
        if (project == null) {
            return null;
        }

        PersonProjectHandover.ProjectCard card = new PersonProjectHandover.ProjectCard();
        card.setProjectId(project.getId());
        card.setProjectName(project.getName());
        card.setProjectCode(project.getCode());
        card.setCustomer(project.getCustomer());
        card.setManager(project.getManager());
        card.setStatus(project.getStatus());
        card.setStartDate(project.getStartDate());
        card.setEndDate(project.getEndDate());
        card.setRole(member.getRole());
        card.setJoinedAt(member.getJoinedAt());

        PersonProjectHandoverRecord handover = handoverMapper.findOne(personId, project.getId());
        if (handover == null) {
            card.setHandoverStatus("未交接");
        } else {
            card.setHandoverToUserId(handover.getHandoverToUserId());
            card.setHandoverToName(handover.getHandoverToName());
            card.setHandoverStatus(handover.getHandoverStatus());
            card.setHandoverRemark(handover.getHandoverRemark());
            card.setHandoverAt(handover.getHandoverAt());
            card.setUpdatedAt(handover.getUpdatedAt());
        }

        List<PersonProjectHandover.HandoverDocument> documents = documentMapper
                .findByPersonAndProject(personId, project.getId())
                .stream()
                .map(this::toDocumentDto)
                .toList();
        card.setDocuments(documents);
        card.setDocumentCount(documents.size());
        documents.stream()
                .map(PersonProjectHandover.HandoverDocument::getUploadedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .ifPresent(card::setLatestDocumentAt);
        return card;
    }

    private PersonProjectHandover.HandoverDocument toDocumentDto(PersonHandoverDocument document) {
        PersonProjectHandover.HandoverDocument dto = new PersonProjectHandover.HandoverDocument();
        dto.setId(document.getId());
        dto.setPersonId(document.getPersonId());
        dto.setProjectId(document.getProjectId());
        dto.setFileName(document.getFileName());
        dto.setStoredPath(document.getStoredPath());
        dto.setDocumentType(document.getDocumentType());
        dto.setSummary(document.getSummary());
        dto.setUploadedAt(document.getUploadedAt());
        return dto;
    }

    private Comparator<PersonProjectHandover.ProjectCard> projectCardComparator() {
        return Comparator
                .comparingInt((PersonProjectHandover.ProjectCard card) -> handoverRank(card.getHandoverStatus(), card.getStatus()))
                .thenComparing(
                        PersonProjectHandover.ProjectCard::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                )
                .thenComparing(
                        PersonProjectHandover.ProjectCard::getLatestDocumentAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                );
    }

    private int handoverRank(String handoverStatus, String projectStatus) {
        if ("交接中".equals(handoverStatus) || "IN_HANDOVER".equals(handoverStatus)) {
            return 0;
        }
        if ("需补充".equals(handoverStatus) || "NEED_MORE".equals(handoverStatus)) {
            return 1;
        }
        if ("IN_PROGRESS".equals(projectStatus) || "进行中".equals(projectStatus)) {
            return 2;
        }
        if ("PLANNING".equals(projectStatus) || "规划中".equals(projectStatus)) {
            return 3;
        }
        if ("已交接".equals(handoverStatus) || "DONE".equals(handoverStatus)) {
            return 4;
        }
        return 5;
    }
}
