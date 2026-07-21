import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/plant-cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastModule],
  template: `
    <!-- Toast global -->
    <p-toast position="top-right" [life]="3500" />

    <!-- Header -->
    <app-header />

    <!-- Page principale -->
    <main class="pv-page-content" style="min-height:100vh">
      <router-outlet />
    </main>

    <!-- Footer -->
    <app-footer />
  `
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Charger le panier si connecté (et non admin)
    if (this.authService.isLoggedIn() && !this.authService.isAdmin()) {
      this.cartService.loadCart().subscribe();
    }
  }
}
