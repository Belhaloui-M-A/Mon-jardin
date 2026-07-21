import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../core/services/order-wishlist.service';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../../core/models/models';
import { I18nService, Translations } from '../../core/services/i18n.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, ToastModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  statusSteps = [
    { status: 'PENDING',   key: 'orders_status_pending' as keyof Translations,   icon: 'pi pi-clock' },
    { status: 'CONFIRMED', key: 'orders_status_confirmed' as keyof Translations, icon: 'pi pi-check' },
    { status: 'SHIPPED',   key: 'orders_status_shipped' as keyof Translations,   icon: 'pi pi-send' },
    { status: 'DELIVERED', key: 'orders_status_delivered' as keyof Translations, icon: 'pi pi-home' },
  ];

  get t() { return this.i18n.t(); }

  constructor(
    private orderService: OrderService,
    private toast: MessageService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: page => { this.orders.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cancel(id: number): void {
    this.orderService.cancel(id).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === id ? updated : o));
        this.toast.add({ severity: 'info', summary: this.t.orders_status_cancelled, detail: `Commande #${id} annulée` });
      },
      error: err => this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message })
    });
  }

  getStatusLabel(status: OrderStatus): string {
    const key = ('orders_status_' + status.toLowerCase()) as keyof Translations;
    return this.t[key] || ORDER_STATUS_LABELS[status];
  }

  getStatusSeverity(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'warn', CONFIRMED: 'info', SHIPPED: 'secondary',
      DELIVERED: 'success', CANCELLED: 'danger'
    };
    return map[status];
  }

  getStatusBg(status: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING:'rgba(251,191,36,.12)', CONFIRMED:'rgba(56,189,248,.12)',
      SHIPPED:'rgba(167,139,250,.12)', DELIVERED:'rgba(74,222,128,.12)', CANCELLED:'rgba(239,68,68,.12)'
    };
    return m[status];
  }
  getStatusColor(status: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING:'#fbbf24', CONFIRMED:'#38bdf8', SHIPPED:'#a78bfa',
      DELIVERED:'#4ade80', CANCELLED:'#f87171'
    };
    return m[status];
  }
  getStatusBorder(status: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING:'rgba(251,191,36,.25)', CONFIRMED:'rgba(56,189,248,.25)',
      SHIPPED:'rgba(167,139,250,.25)', DELIVERED:'rgba(74,222,128,.25)', CANCELLED:'rgba(239,68,68,.25)'
    };
    return m[status];
  }

  isStepDone(currentStatus: OrderStatus, stepStatus: string): boolean {
    const order = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    return order.indexOf(currentStatus) >= order.indexOf(stepStatus);
  }
}
