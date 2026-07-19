import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/models';

export interface Review {
  id: number;
  user: { id: number; firstName: string; lastName: string; email: string };
  targetType: 'SERVICE' | 'DELIVERY' | 'QUALITY' | 'OVERALL';
  rating: number;
  comment?: string;
  published: boolean;
  createdAt: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { rating: number; count: number }[];
  byTarget: { target: string; avg: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = '/api/reviews';

  constructor(private http: HttpClient) {}

  getPublished(page = 0, size = 10): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(`${this.API}?page=${page}&size=${size}`);
  }

  getStats(): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.API}/stats`);
  }

  submit(data: { targetType: string; rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(this.API, data);
  }

  update(id: number, data: { rating: number; comment: string }): Observable<Review> {
    return this.http.put<Review>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  // Admin
  getAll(page = 0, size = 20): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(`${this.API}/all?page=${page}&size=${size}`);
  }

  togglePublished(id: number): Observable<Review> {
    return this.http.patch<Review>(`${this.API}/${id}/toggle`, {});
  }
}
