import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WishlistItem } from '../../core/models/models';
import { WishlistService } from '../../core/services/order-wishlist.service';
import { CartService } from '../../core/services/plant-cart.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, ToastModule],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent implements OnInit {
  items = signal<WishlistItem[]>([]);

  get t() { return this.i18n.t(); }

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private toast: MessageService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.wishlistService.getWishlist().subscribe(items => this.items.set(items));
  }

  remove(item: WishlistItem): void {
    this.wishlistService.remove(item.plant.id).subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== item.id))
    });
  }

  addToCart(item: WishlistItem): void {
    this.cartService.add(item.plant.id).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: '✓', detail: `La plante '${item.plant.name}' est au panier` }),
      error: err => this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message })
    });
  }
}
