import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/plant-cart.service';
import { ThreeBackgroundService } from './core/services/three-background.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastModule],
  template: `
    <!-- Fond 3D Three.js (fixe, z-index 0) -->
    <canvas id="pv-canvas"></canvas>
    <div id="pv-cursor-glow"></div>

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
    private cartService: CartService,
    private threeBg: ThreeBackgroundService
  ) {}

  ngOnInit(): void {
    // Initialiser le fond 3D Three.js
    this.threeBg.init('pv-canvas');
    // Charger le panier si connecté
    if (this.authService.isLoggedIn()) {
      this.cartService.loadCart().subscribe();
    }
  }
}
