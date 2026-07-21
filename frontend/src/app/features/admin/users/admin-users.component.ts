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
import { User } from '../../../core/models/models';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  
  displayCreateModal = signal(false);
  userForm: FormGroup;
  submitting = signal(false);

  private fb = inject(FormBuilder);

  get t() { return this.i18n.t(); }

  constructor(
    private http: HttpClient,
    private toast: MessageService,
    public i18n: I18nService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CLIENT', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
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
}
