import { Component, signal, effect, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MessageService } from "primeng/api";
import { AuthService } from "../../../core/services/auth.service";
import { CartService } from "../../../core/services/plant-cart.service";
import { I18nService, Lang } from "../../../core/services/i18n.service";
import { OrderService } from "../../../core/services/order-wishlist.service";
import { SiteSettingsService } from "../../../core/services/site-settings.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule
  ],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  isMenuOpen = false;
  isLangOpen = false;
  isMobileNavOpen = false;

  languages = [
    { code: "fr" as Lang, label: "Français", flag: "🇫🇷", short: "FR" },
    { code: "ar" as Lang, label: "العربية", flag: "🇩🇿", short: "عر" },
  ];

  isDark = signal<boolean>(true);
  displaySettingsModal = signal(false);
  settingsForm: FormGroup;
  savingSettings = signal(false);

  private pollingInterval: any;

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public i18n: I18nService,
    private http: HttpClient,
    public orderService: OrderService,
    public siteSettingsService: SiteSettingsService,
    private fb: FormBuilder,
    private toast: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.settingsForm = this.fb.group({
      emailContact: ['', [Validators.required, Validators.email]],
      phoneContact: ['', Validators.required],
      addressFr: ['', Validators.required],
      addressAr: ['', Validators.required],
      openingHours: ['Lun–Sam : 8h–18h', Validators.required],
      descriptionFr: ['', Validators.required],
      descriptionAr: ['', Validators.required],
    });

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('pv_theme');
      const dark = saved ? saved === 'dark' : true;
      this.isDark.set(dark);
      this.applyTheme(dark);

      // Poll pending orders count if admin
      this.pollingInterval = setInterval(() => {
        if (this.auth.isAdmin()) {
          this.orderService.fetchPendingOrdersCount();
        }
      }, 10000); // 10 seconds
    }
    effect(() => {
      this.applyTheme(this.isDark());
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('pv_theme', this.isDark() ? 'dark' : 'light');
      }
      
      // Initial fetch if admin becomes true
      if (this.auth.isAdmin()) {
         this.orderService.fetchPendingOrdersCount();
      }
    });
  }

  get pendingOrdersCount() {
    return this.orderService.pendingOrdersCount;
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  get t() {
    return this.i18n.t();
  }
  get cartCount() {
    return this.cart.count();
  }
  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }
  get isAdmin() {
    return this.auth.isAdmin();
  }
  get user() {
    return this.auth.currentUser();
  }
  get currentLang() {
    return this.i18n.currentLang();
  }

  getCurrentLang() {
    return (
      this.languages.find((l) => l.code === this.currentLang) ??
      this.languages[0]
    );
  }

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
    this.isLangOpen = false;
  }

  getUserInitials(): string {
    const u = this.auth.currentUser();
    if (!u) return "";
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }

  showSettingsModal(): void {
    const current = this.siteSettingsService.settings();
    if (current) {
      this.settingsForm.patchValue(current);
    }
    this.displaySettingsModal.set(true);
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.savingSettings.set(true);
      this.siteSettingsService.updateSettings(this.settingsForm.value).subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Paramètres mis à jour avec succès'
          });
          this.displaySettingsModal.set(false);
          this.savingSettings.set(false);
        },
        error: () => {
          this.toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la mise à jour des paramètres'
          });
          this.savingSettings.set(false);
        }
      });
    }
  }

  toggleTheme(): void {
    this.isDark.set(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }
  }
}
