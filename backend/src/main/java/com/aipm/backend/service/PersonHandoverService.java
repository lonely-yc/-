package com.aipm.backend.service;

import com.aipm.backend.dto.PersonProjectHandover;
import com.aipm.backend.entity.PersonHandoverDocument;
import com.aipm.backend.entity.PersonProjectHandoverRecord;

public interface PersonHandoverService {
    PersonProjectHandover getPersonProjectHandover(Long personId);

    PersonProjectHandoverRecord saveHandover(Long personId, Long projectId, PersonProjectHandoverRecord record);

    PersonHandoverDocument addDocument(Long personId, Long projectId, PersonHandoverDocument document);

    void deleteDocument(Long documentId);
}
