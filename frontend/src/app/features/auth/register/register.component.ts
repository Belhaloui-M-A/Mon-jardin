import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/plant-cart.service';
import { I18nService } from '../../../core/services/i18n.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v = control.value || '';
  if (v.length < 8)                      return { tooShort: true };
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule,
            InputTextModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  form: FormGroup;
  loading   = false;
  step      = signal(1);   // 1 = infos perso, 2 = compte, 3 = succès
  showPwd   = signal(false);

  get t()    { return this.i18n.t(); }
  get isRtl(){ return this.i18n.isRtl(); }

  get passwordStrength(): number {
    const v = this.form.get('password')?.value || '';
    let s = 0;
    if (v.length >= 8)       s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }

  get strengthLabel(): string {
    const labels: Record<string, string[]> = {
      fr: ['', 'Faible', 'Moyen', 'Bon', 'Fort'],
      en: ['', 'Weak', 'Medium', 'Good', 'Strong'],
      ar: ['', 'ضعيف', 'متوسط', 'جيد', 'قوي'],
    };
    return (labels[this.i18n.currentLang()] || labels['fr'])[this.passwordStrength] || '';
  }

  get strengthColor(): string {
    return ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'][this.passwordStrength] || '#ef4444';
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private cart: CartService,
    private router: Router,
    private toast: MessageService,
    public i18n: I18nService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone:     ['', [Validators.required, Validators.pattern(/^(0)[5-7][0-9]{8}$/)]],
      address:   ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, passwordStrength]],
      confirm:   ['', Validators.required]
    }, { validators: this.confirmMatch });
  }

  confirmMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p === c ? null : { mismatch: true };
  }

  nextStep(): void {
    const step1Fields = ['firstName','lastName','phone', 'address'];
    step1Fields.forEach(f => this.form.get(f)?.markAsTouched());
    const valid = step1Fields.every(f => this.form.get(f)?.valid);
    if (valid) this.step.set(2);
  }

  prevStep(): void { this.step.set(1); }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const lang = this.i18n.currentLang();
      const summary = lang === 'ar' ? 'خطأ' : 'Erreur';
      const detail = lang === 'ar' ? 'يرجى تصحيح الأخطاء في النموذج' : 'Veuillez corriger les erreurs du formulaire';
      this.toast.add({ severity: 'error', summary, detail });
      return;
    }
    this.loading = true;

    const { confirm, terms, ...data } = this.form.value;
    this.auth.register(data).subscribe({
      next: () => {
        this.cart.loadCart().subscribe();
        this.step.set(3);
        this.loading = false;
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Inscription échouée' });
        this.loading = false;
      }
    });
  }

  goToCatalogue(): void { this.router.navigate(['/catalogue']); }

  f(name: string) { return this.form.get(name)!; }
  hasError(field: string, error: string) { return this.f(field).hasError(error) && this.f(field).touched; }
}
