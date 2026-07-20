import { Component } from "@angular/core";
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

  languages = [
    { code: "fr" as Lang, label: "Français", flag: "🇫🇷", short: "FR" },
    { code: "en" as Lang, label: "English", flag: "🇬🇧", short: "EN" },
    { code: "ar" as Lang, label: "العربية", flag: "🇩🇿", short: "عر" },
  ];

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public i18n: I18nService,
  ) {}

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
}
