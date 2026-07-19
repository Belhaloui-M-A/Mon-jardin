import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../core/services/plant-cart.service';
import { CartItem } from '../../core/models/models';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  get t() { return this.i18n.t(); }

  constructor(
    public cart: CartService,
    private toast: MessageService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.cart.loadCart().subscribe();
  }

  getPrice(item: CartItem): number {
    const p = item.plant;
    return p.discountPercent && p.discountPercent > 0
      ? p.price * (1 - p.discountPercent / 100) : p.price;
  }

  updateQty(item: CartItem, qty: number): void {
    this.cart.update(item.plant.id, qty).subscribe({
      error: err => this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message })
    });
  }

  remove(item: CartItem): void {
    this.cart.remove(item.plant.id).subscribe();
  }

  clearCart(): void {
    this.cart.clear().subscribe();
  }
}
