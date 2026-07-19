import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User } from '../../../core/models/models';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);

  get t() { return this.i18n.t(); }

  constructor(
    private http: HttpClient,
    private toast: MessageService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.http.get<User[]>('/api/users').subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false)
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
