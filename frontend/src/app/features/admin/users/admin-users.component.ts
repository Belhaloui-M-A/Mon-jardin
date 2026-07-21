import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { User, SiteSettings } from '../../../core/models/models';
import { I18nService } from '../../../core/services/i18n.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule, InputTextModule, InputTextareaModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  
  displayCreateModal = signal(false);
  displaySettingsModal = signal(false);
  userForm: FormGroup;
  settingsForm: FormGroup;
  submitting = signal(false);
  savingSettings = signal(false);

  private fb = inject(FormBuilder);

  get t() { return this.i18n.t(); }

  constructor(
    private http: HttpClient,
    private toast: MessageService,
    public i18n: I18nService,
    public siteSettingsService: SiteSettingsService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CLIENT', Validators.required]
    });

    this.settingsForm = this.fb.group({
      emailContact: ['', [Validators.required, Validators.email]],
      phoneContact: ['', Validators.required],
      addressFr: ['', Validators.required],
      addressAr: ['', Validators.required],
      descriptionFr: ['', Validators.required],
      descriptionAr: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.siteSettingsService.fetchSettings();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<User[]>('/api/users').subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  showCreateModal(): void {
    this.userForm.reset({ role: 'CLIENT' });
    this.displayCreateModal.set(true);
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.submitting.set(true);
    this.http.post<User>('/api/users', this.userForm.value).subscribe({
      next: (newUser) => {
        this.users.update(list => [...list, newUser]);
        this.displayCreateModal.set(false);
        this.submitting.set(false);
        this.toast.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé' });
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Erreur lors de la création' });
      }
    });
  }

  toggleStatus(user: User): void {
    this.http.patch<User>(`/api/users/${user.id}/toggle`, {}).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === user.id ? updated : u));
        this.toast.add({
          severity: updated.enabled ? 'success' : 'warn',
          summary: updated.enabled ? this.t.admin_users_active : this.t.admin_users_disabled,
          detail: `${user.firstName} ${user.lastName}`
        });
      }
    });
  }

  showSettingsModal(): void {
    const current = this.siteSettingsService.settings();
    if (current) {
      this.settingsForm.patchValue(current);
    }
    this.displaySettingsModal.set(true);
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.savingSettings.set(true);
    this.siteSettingsService.updateSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.savingSettings.set(false);
        this.displaySettingsModal.set(false);
        this.toast.add({ severity: 'success', summary: 'Succès', detail: 'Informations mises à jour' });
      },
      error: () => {
        this.savingSettings.set(false);
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour' });
      }
    });
  }
}
