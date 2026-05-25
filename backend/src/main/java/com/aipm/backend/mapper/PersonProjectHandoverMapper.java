package com.aipm.backend.mapper;

import com.aipm.backend.entity.PersonProjectHandoverRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PersonProjectHandoverMapper {
    List<PersonProjectHandoverRecord> findByPersonId(Long personId);

    PersonProjectHandoverRecord findOne(@Param("personId") Long personId, @Param("projectId") Long projectId);

    int upsert(PersonProjectHandoverRecord record);
}
