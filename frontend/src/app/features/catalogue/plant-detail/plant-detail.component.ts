import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Plant } from '../../../core/models/models';
import { PlantService, CartService } from '../../../core/services/plant-cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/order-wishlist.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, ButtonModule, SkeletonModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './plant-detail.component.html'
})
export class PlantDetailComponent implements OnInit {
  plant = signal<Plant | null>(null);
  activeImageIndex = signal(0);
  similar = signal<Plant[]>([]);
  loading = signal(true);
  quantity = signal(1);
  addingToCart = signal(false);
  inWishlist = signal(false);
  toggleWishlistLoading = signal(false);

  get t() { return this.i18n.t(); }

  constructor(
    private route: ActivatedRoute,
    private plantService: PlantService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public auth: AuthService,
    private toast: MessageService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loading.set(true);
      this.plantService.getById(id).subscribe({
        next: p => {
          this.plant.set(p);
          this.activeImageIndex.set(0);
          this.loading.set(false);
          this.plantService.getSimilar(id).subscribe(s => this.similar.set(s));
          if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
            this.checkWishlist(id);
          }
        }
      });
    });
  }

  checkWishlist(plantId: number): void {
    this.wishlistService.getWishlist().subscribe(items => {
      this.inWishlist.set(items.some(i => i.plant.id === plantId));
    });
  }

  incrementQty(): void {
    const p = this.plant();
    if (p && this.quantity() < p.stock) this.quantity.update(q => q + 1);
  }
  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart(): void {
    const p = this.plant();
    if (!p || !this.auth.isLoggedIn()) return;
    this.addingToCart.set(true);
    this.cartService.add(p.id, this.quantity()).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Panier', detail: `${p.name} ajouté au panier` });
        this.addingToCart.set(false);
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message });
        this.addingToCart.set(false);
      }
    });
  }

  toggleWishlist(): void {
    const p = this.plant();
    if (!p || !this.auth.isLoggedIn()) return;
    this.toggleWishlistLoading.set(true);
    const isIn = this.inWishlist();
    this.wishlistService.toggle(p.id, isIn).subscribe({
      next: () => {
        this.inWishlist.set(!isIn);
        this.toast.add({
          severity: 'success',
          summary: isIn ? 'Retiré des favoris' : 'Ajouté aux favoris',
          detail: p.name
        });
        this.toggleWishlistLoading.set(false);
      }
    });
  }

  getFinalPrice(): number {
    const p = this.plant();
    if (!p) return 0;
    if (p.discountPercent && p.discountPercent > 0)
      return p.price * (1 - p.discountPercent / 100);
    return p.price;
  }

  getDifficultyColor(): string {
    switch (this.plant()?.difficultyLevel) {
      case 'FACILE': return 'success';
      case 'MOYEN':  return 'warning';
      default:       return 'danger';
    }
  }
}
