package com.aipm.backend.mapper;

import com.aipm.backend.entity.PersonHandoverDocument;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PersonHandoverDocumentMapper {
    List<PersonHandoverDocument> findByPersonId(Long personId);

    List<PersonHandoverDocument> findByPersonAndProject(@Param("personId") Long personId, @Param("projectId") Long projectId);

    int insert(PersonHandoverDocument document);

    int delete(Long id);
}
