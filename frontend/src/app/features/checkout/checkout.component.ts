import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../core/services/plant-cart.service';
import { OrderService } from '../../core/services/order-wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/models';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule,
            ButtonModule, InputTextModule, InputTextareaModule, ToastModule],
  providers: [MessageService],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  loading = false;
  orderPlaced = false;
  orderId: number | null = null;

  get t() { return this.i18n.t(); }

  constructor(
    private fb: FormBuilder,
    private cart: CartService,
    private orderService: OrderService,
    private auth: AuthService,
    private router: Router,
    private toast: MessageService,
    public i18n: I18nService
  ) {
    const user = this.auth.currentUser();
    this.form = this.fb.group({
      deliveryAddress: ['', Validators.required],
      deliveryCity:    ['', Validators.required],
      deliveryPhone:   ['', Validators.required],
      notes:           ['']
    });
  }

  ngOnInit(): void {
    this.cart.loadCart().subscribe({
      next: items => {
        if (items.length === 0) this.router.navigate(['/cart']);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.orderService.placeOrder(this.form.value).subscribe({
      next: order => {
        this.orderPlaced = true;
        this.orderId = order.id;
        this.loading = false;
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message });
        this.loading = false;
      }
    });
  }

  getPrice(item: CartItem): number {
    return item.plant.discountPercent && item.plant.discountPercent > 0
      ? item.plant.price * (1 - item.plant.discountPercent / 100)
      : item.plant.price;
  }

  get items() { return this.cart.items(); }
  get total() { return this.cart.total(); }
  f(n: string) { return this.form.get(n)!; }
}
