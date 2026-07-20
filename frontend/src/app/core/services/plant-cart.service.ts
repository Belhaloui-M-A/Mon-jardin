import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartItem, Page, Plant, PlantSearchParams } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly API = '/api/plants';

  constructor(private http: HttpClient) {}

  search(params: PlantSearchParams): Observable<Page<Plant>> {
    let p = new HttpParams();
    if (params.categoryId) p = p.set('categoryId', params.categoryId);
    if (params.minPrice)   p = p.set('minPrice', params.minPrice);
    if (params.maxPrice)   p = p.set('maxPrice', params.maxPrice);
    if (params.search)     p = p.set('search', params.search);
    if (params.inStock !== undefined) p = p.set('inStock', params.inStock);
    if (params.sortBy)     p = p.set('sortBy', params.sortBy);
    p = p.set('page', params.page ?? 0);
    p = p.set('size', params.size ?? 12);
    return this.http.get<Page<Plant>>(this.API, { params: p });
  }

  getPlantOfTheMonth(): Observable<Plant> {
    return this.http.get<Plant>(`${this.API}/featured`);
  }

  getById(id: number): Observable<Plant> {
    return this.http.get<Plant>(`${this.API}/${id}`);
  }

  getSimilar(id: number): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.API}/${id}/similar`);
  }

  create(plant: Partial<Plant>, categoryId: number): Observable<Plant> {
    return this.http.post<Plant>(`${this.API}?categoryId=${categoryId}`, plant);
  }

  update(id: number, plant: Partial<Plant>, categoryId?: number): Observable<Plant> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return this.http.put<Plant>(`${this.API}/${id}${params}`, plant);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  createMultipart(formData: FormData): Observable<Plant> {
    return this.http.post<Plant>(this.API, formData);
  }

  updateMultipart(id: number, formData: FormData): Observable<Plant> {
    return this.http.put<Plant>(`${this.API}/${id}`, formData);
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = '/api/cart';

  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  // Badge header : somme des quantités (pas le nombre de lignes)
  readonly count = computed(() =>
    this._items().reduce((n, item) => n + item.quantity, 0)
  );
  readonly total = computed(() =>
    this._items().reduce((sum, item) =>
      sum + (item.plant.finalPrice ?? item.plant.price) * item.quantity, 0)
  );

  constructor(private http: HttpClient) {}

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.API).pipe(
      tap(items => this._items.set(items))
    );
  }

  add(plantId: number, quantity = 1): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.API}/${plantId}`, { quantity })
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  update(plantId: number, quantity: number): Observable<CartItem | null> {
    return this.http.put<CartItem>(`${this.API}/${plantId}`, { quantity })
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  remove(plantId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${plantId}`)
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  clear(): Observable<void> {
    return this.http.delete<void>(this.API)
      .pipe(tap(() => this._items.set([])));
  }
}
