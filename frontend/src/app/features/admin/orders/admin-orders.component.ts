import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
} from "../../../core/models/models";
import { OrderService } from "../../../core/services/order-wishlist.service";
import { I18nService, Translations } from "../../../core/services/i18n.service";

@Component({
  selector: "app-admin-orders",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    DropdownModule,
    ToastModule,
  ],
  templateUrl: "./admin-orders.component.html",
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  expandedRows: { [key: string]: boolean } = {};

  statusFlow: { [key: string]: { label: string; value: OrderStatus }[] } = {
    PENDING: [
      { label: "Confirmer", value: "CONFIRMED" },
      { label: "Annuler", value: "CANCELLED" },
    ],
    CONFIRMED: [
      { label: "Expédier", value: "SHIPPED" },
      { label: "Annuler", value: "CANCELLED" },
    ],
    SHIPPED: [{ label: "Marquer livré", value: "DELIVERED" }],
  };

  get t() {
    return this.i18n.t();
  }

  constructor(
    private orderService: OrderService,
    private toast: MessageService,
    public i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.orderService.getAllOrders(0, 100).subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.loading.set(false);
      },
    });
  }

  updateStatus(id: number, status: OrderStatus): void {
    this.orderService.updateStatus(id, status).subscribe({
      next: (updated) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === id ? updated : o)),
        );
        this.orderService.fetchPendingOrdersCount();
        const summaryMsg =
          this.i18n.currentLang() === "ar"
            ? "تم تحديث الحالة"
            : "Statut mis à jour";
        this.toast.add({
          severity: "success",
          summary: summaryMsg,
          detail: `Commande #${id} → ${this.getLabel(status)}`,
        });
      },
      error: (err) =>
        this.toast.add({
          severity: "error",
          summary: "Erreur",
          detail: err.error?.message,
        }),
    });
  }

  getNextStatuses(status: OrderStatus) {
    const flow = this.statusFlow[status] || [];
    return flow.map((f) => {
      let label = f.label;
      if (f.value === "CONFIRMED") label = this.t.admin_orders_confirm_btn;
      if (f.value === "SHIPPED") label = this.t.admin_orders_ship_btn;
      if (f.value === "DELIVERED") label = this.t.admin_orders_deliver_btn;
      if (f.value === "CANCELLED") label = this.t.admin_orders_cancel_btn;
      return { ...f, label };
    });
  }

  getStatusBg(status: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING: "rgba(251,191,36,.12)",
      CONFIRMED: "rgba(56,189,248,.12)",
      SHIPPED: "rgba(167,139,250,.12)",
      DELIVERED: "rgba(74,222,128,.12)",
      CANCELLED: "rgba(239,68,68,.12)",
    };
    return m[status];
  }
  getStatusColor(status: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING: "#fbbf24",
      CONFIRMED: "#38bdf8",
      SHIPPED: "#a78bfa",
      DELIVERED: "#4ade80",
      CANCELLED: "#f87171",
    };
    return m[status];
  }
  getLabel(status: OrderStatus): string {
    const key = ("orders_status_" + status.toLowerCase()) as keyof Translations;
    return this.t[key] || ORDER_STATUS_LABELS[status];
  }

  getSeverity(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: "warn",
      CONFIRMED: "info",
      SHIPPED: "secondary",
      DELIVERED: "success",
      CANCELLED: "danger",
    };
    return map[status];
  }

  toggleRow(order: Order): void {
    const key = order.id.toString();
    this.expandedRows[key] = !this.expandedRows[key];
  }
}
