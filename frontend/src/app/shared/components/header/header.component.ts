import { Component, signal, effect, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { CartService } from "../../../core/services/plant-cart.service";
import { I18nService, Lang } from "../../../core/services/i18n.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
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

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public i18n: I18nService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('pv_theme');
      const dark = saved ? saved === 'dark' : true;
      this.isDark.set(dark);
      this.applyTheme(dark);
    }
    effect(() => {
      this.applyTheme(this.isDark());
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('pv_theme', this.isDark() ? 'dark' : 'light');
      }
    });
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

  toggleTheme(): void {
    this.isDark.set(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }
  }
}
