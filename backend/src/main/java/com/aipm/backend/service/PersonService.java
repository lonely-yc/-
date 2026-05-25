package com.aipm.backend.service;

import com.aipm.backend.entity.Person;

import java.util.List;

public interface PersonService {
    List<Person> findAll();
    Person findById(Long id);
    Person create(Person person);
    int update(Person person);
    int delete(Long id);
}
