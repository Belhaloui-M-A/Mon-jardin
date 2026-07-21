import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus, Page, WishlistItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = '/api/orders';

  public pendingOrdersCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  fetchPendingOrdersCount(): void {
    this.http.get<number>('/api/admin/stats/pending-orders-count').subscribe({
      next: count => this.pendingOrdersCount.set(count),
      error: () => {}
    });
  }

  placeOrder(data: {
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPhone: string;
    notes?: string;
  }): Observable<Order> {
    return this.http.post<Order>(this.API, data);
  }

  getMyOrders(page = 0, size = 10): Observable<Page<Order>> {
    return this.http.get<Page<Order>>(`${this.API}/my?page=${page}&size=${size}`);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API}/${id}`);
  }

  // Admin
  getAllOrders(page = 0, size = 20): Observable<Page<Order>> {
    return this.http.get<Page<Order>>(`${this.API}?page=${page}&size=${size}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.API}/${id}/status`, { status });
  }

  cancel(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.API}/${id}/cancel`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly API = '/api/wishlist';

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(this.API);
  }

  add(plantId: number): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.API}/${plantId}`, {});
  }

  remove(plantId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${plantId}`);
  }

  toggle(plantId: number, isInWishlist: boolean): Observable<WishlistItem | void> {
    return isInWishlist ? this.remove(plantId) : this.add(plantId);
  }
}
