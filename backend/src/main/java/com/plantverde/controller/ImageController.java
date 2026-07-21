package com.plantverde.controller;

import com.plantverde.entity.StoredImage;
import com.plantverde.repository.StoredImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/images")
public class ImageController {

    @Autowired
    private StoredImageRepository storedImageRepository;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        Optional<StoredImage> imageOptional = storedImageRepository.findById(id);

        if (imageOptional.isPresent()) {
            StoredImage image = imageOptional.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getName() + "\"")
                    .contentType(MediaType.parseMediaType(image.getContentType() != null ? image.getContentType() : "application/octet-stream"))
                    .body(image.getData());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
