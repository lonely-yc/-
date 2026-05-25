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
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PersonHandoverServiceImplTest {
    @Test
    void buildsPersonProjectCardsWithOnlyPersonalHandoverDocuments() {
        FakeDocumentMapper documentMapper = new FakeDocumentMapper();
        PersonHandoverServiceImpl service = new PersonHandoverServiceImpl(
                new FakePersonMapper(),
                new FakeProjectMapper(),
                new FakeMemberMapper(),
                new FakeHandoverMapper(),
                documentMapper
        );

        PersonProjectHandover response = service.getPersonProjectHandover(1L);

        assertThat(response.getPerson().getRealName()).isEqualTo("Li Nan");
        assertThat(response.getProjects()).hasSize(1);

        PersonProjectHandover.ProjectCard card = response.getProjects().get(0);
        assertThat(card.getProjectName()).isEqualTo("Power Agent");
        assertThat(card.getRole()).isEqualTo("PM");
        assertThat(card.getHandoverStatus()).isEqualTo("IN_HANDOVER");
        assertThat(card.getHandoverToName()).isEqualTo("Chen Yue");
        assertThat(card.getDocuments()).extracting(PersonProjectHandover.HandoverDocument::getFileName)
                .containsExactly("power-agent-handover.md");
    }

    @Test
    void deletesPersonalHandoverDocumentById() {
        FakeDocumentMapper documentMapper = new FakeDocumentMapper();
        PersonHandoverServiceImpl service = new PersonHandoverServiceImpl(
                new FakePersonMapper(),
                new FakeProjectMapper(),
                new FakeMemberMapper(),
                new FakeHandoverMapper(),
                documentMapper
        );

        service.deleteDocument(77L);

        assertThat(documentMapper.deletedId).isEqualTo(77L);
    }

    private static class FakePersonMapper implements PersonMapper {
        @Override
        public List<Person> findAll() {
            return List.of();
        }

        @Override
        public Person findById(Long id) {
            Person person = new Person();
            person.setId(id);
            person.setEmployeeNo("PM001");
            person.setRealName("Li Nan");
            person.setPhone("13800000001");
            person.setRole("PM");
            return person;
        }

        @Override
        public int insert(Person person) {
            return 0;
        }

        @Override
        public int update(Person person) {
            return 0;
        }

        @Override
        public int delete(Long id) {
            return 0;
        }
    }

    private static class FakeProjectMapper implements ProjectMapper {
        @Override
        public List<Project> findAll() {
            return List.of();
        }

        @Override
        public Project findById(Long id) {
            Project project = new Project();
            project.setId(id);
            project.setName("Power Agent");
            project.setCode("POWER-AI-2026-01");
            project.setCustomer("RuanSoft");
            project.setManager("Li Nan");
            project.setStatus("IN_PROGRESS");
            project.setStartDate(LocalDate.of(2026, 5, 21));
            project.setEndDate(LocalDate.of(2026, 6, 30));
            return project;
        }

        @Override
        public int insert(Project project) {
            return 0;
        }

        @Override
        public int update(Project project) {
            return 0;
        }

        @Override
        public int delete(Long id) {
            return 0;
        }
    }

    private static class FakeMemberMapper implements ProjectMemberMapper {
        @Override
        public List<ProjectMember> findByProjectId(Long projectId) {
            return List.of();
        }

        @Override
        public List<ProjectMember> findByUserId(Long userId) {
            ProjectMember member = new ProjectMember();
            member.setProjectId(1L);
            member.setUserId(userId);
            member.setRole("PM");
            member.setJoinedAt(LocalDateTime.of(2026, 5, 21, 9, 0));
            return List.of(member);
        }

        @Override
        public int insert(ProjectMember member) {
            return 0;
        }

        @Override
        public int deleteByProjectId(Long projectId) {
            return 0;
        }
    }

    private static class FakeHandoverMapper implements PersonProjectHandoverMapper {
        @Override
        public List<PersonProjectHandoverRecord> findByPersonId(Long personId) {
            return List.of();
        }

        @Override
        public PersonProjectHandoverRecord findOne(Long personId, Long projectId) {
            PersonProjectHandoverRecord record = new PersonProjectHandoverRecord();
            record.setPersonId(personId);
            record.setProjectId(projectId);
            record.setHandoverToUserId(2L);
            record.setHandoverToName("Chen Yue");
            record.setHandoverStatus("IN_HANDOVER");
            record.setHandoverRemark("Explain outage reason review and field deployment path.");
            record.setHandoverAt(LocalDateTime.of(2026, 5, 30, 17, 30));
            record.setUpdatedAt(LocalDateTime.of(2026, 5, 30, 17, 30));
            return record;
        }

        @Override
        public int upsert(PersonProjectHandoverRecord record) {
            return 0;
        }
    }

    private static class FakeDocumentMapper implements PersonHandoverDocumentMapper {
        private Long deletedId;

        @Override
        public List<PersonHandoverDocument> findByPersonId(Long personId) {
            return List.of();
        }

        @Override
        public List<PersonHandoverDocument> findByPersonAndProject(Long personId, Long projectId) {
            PersonHandoverDocument document = new PersonHandoverDocument();
            document.setPersonId(personId);
            document.setProjectId(projectId);
            document.setFileName("power-agent-handover.md");
            document.setStoredPath("uploads/person-handover/1/1/readme.md");
            document.setDocumentType("HANDOVER_NOTE");
            document.setSummary("Interfaces, data paths, and field contacts.");
            document.setUploadedAt(LocalDateTime.of(2026, 5, 30, 18, 0));
            return List.of(document);
        }

        @Override
        public int insert(PersonHandoverDocument document) {
            return 0;
        }

        @Override
        public int delete(Long id) {
            this.deletedId = id;
            return 0;
        }
    }
}
