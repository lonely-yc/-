package com.aipm.backend.service.impl;

import com.aipm.backend.entity.Person;
import com.aipm.backend.mapper.PersonMapper;
import com.aipm.backend.service.PersonService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonServiceImpl implements PersonService {
    private final PersonMapper personMapper;

    public PersonServiceImpl(PersonMapper personMapper) {
        this.personMapper = personMapper;
    }

    @Override
    public List<Person> findAll() {
        return personMapper.findAll();
    }

    @Override
    public Person findById(Long id) {
        return personMapper.findById(id);
    }

    @Override
    public Person create(Person person) {
        if (person.getPassword() == null || person.getPassword().isBlank()) {
            person.setPassword("123456");
        }
        personMapper.insert(person);
        person.setPassword(null);
        return person;
    }

    @Override
    public int update(Person person) {
        return personMapper.update(person);
    }

    @Override
    public int delete(Long id) {
        return personMapper.delete(id);
    }
}
