import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  form: FormGroup;
  saving = false;

  get t() { return this.i18n.t(); }

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private http: HttpClient,
    private toast: MessageService,
    public i18n: I18nService
  ) {
    const u = auth.currentUser();
    this.form = this.fb.group({
      firstName: [u?.firstName || '', Validators.required],
      lastName:  [u?.lastName  || '', Validators.required],
      phone:     [''],
      address:   [''],
    });
    // Load full profile
    this.http.get<any>('/api/users/me').subscribe(profile => {
      this.form.patchValue(profile);
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.http.put('/api/users/me', this.form.value).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sauvegardé', detail: 'Profil mis à jour' });
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  getInitials(): string {
    const u = this.auth.currentUser();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '';
  }
}
