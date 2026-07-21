package com.plantverde.service;

import com.plantverde.entity.StoredImage;
import com.plantverde.repository.StoredImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
public class FileStorageService {

    @Autowired
    private StoredImageRepository storedImageRepository;

    @Transactional
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }
        try {
            StoredImage storedImage = StoredImage.builder()
                    .name(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .data(file.getBytes())
                    .build();

            StoredImage savedImage = storedImageRepository.save(storedImage);
            return "/api/images/" + savedImage.getId();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file in database.", e);
        }
    }
}
