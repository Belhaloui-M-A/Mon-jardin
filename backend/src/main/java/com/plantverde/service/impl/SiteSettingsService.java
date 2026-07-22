package com.plantverde.service.impl;

import com.plantverde.entity.SiteSettings;
import com.plantverde.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository repository;

    @Transactional(readOnly = true)
    public SiteSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            return new SiteSettings();
        });
    }

    @Transactional
    public SiteSettings updateSettings(SiteSettings updated) {
        SiteSettings current = getSettings();
        current.setEmailContact(updated.getEmailContact());
        current.setPhoneContact(updated.getPhoneContact());
        current.setAddressFr(updated.getAddressFr());
        current.setAddressAr(updated.getAddressAr());
        current.setOpeningHours(updated.getOpeningHours());
        current.setDescriptionFr(updated.getDescriptionFr());
        current.setDescriptionAr(updated.getDescriptionAr());
        return repository.save(current);
    }
}
