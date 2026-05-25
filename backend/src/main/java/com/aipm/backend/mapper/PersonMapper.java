package com.aipm.backend.mapper;

import com.aipm.backend.entity.Person;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PersonMapper {
    List<Person> findAll();
    Person findById(Long id);
    int insert(Person person);
    int update(Person person);
    int delete(Long id);
}
