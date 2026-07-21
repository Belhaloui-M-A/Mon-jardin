import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/plant-cart.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule,
            InputTextModule, PasswordModule, ButtonModule, ToastModule, DialogModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  displayDeactivatedPopup = false;
  deactivatedMessage = '';

  get t() { return this.i18n.t(); }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private cart: CartService,
    private router: Router,
    private toast: MessageService,
    public i18n: I18nService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: user => {
        if (user.role !== 'ADMIN') {
          this.cart.loadCart().subscribe();
        }
        this.router.navigate(user.role === 'ADMIN' ? ['/admin'] : ['/catalogue']);
      },
      error: err => {
        const errorMsg = err.error?.message || 'Identifiants incorrects';
        if (errorMsg.includes('désactivé')) {
          this.deactivatedMessage = errorMsg;
          this.displayDeactivatedPopup = true;
        } else {
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg });
        }
        this.loading = false;
      }
    });
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
