package com.aipm.backend.controller;

import com.aipm.backend.entity.Person;
import com.aipm.backend.service.PersonService;
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
@RequestMapping("/api/users")
public class PersonController {
    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    public Map<String, Object> list() {
        List<Person> people = personService.findAll();
        people.forEach(PersonController::hidePassword);
        return ApiResponse.ok(people);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        Person person = personService.findById(id);
        if (person == null) {
            return ApiResponse.error(404, "人员不存在");
        }
        hidePassword(person);
        return ApiResponse.ok(person);
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Person person) {
        return ApiResponse.ok("创建成功", personService.create(person));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Person person) {
        person.setId(id);
        personService.update(person);
        return ApiResponse.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        personService.delete(id);
        return ApiResponse.ok("删除成功");
    }

    private static void hidePassword(Person person) {
        person.setPassword(null);
    }
}
