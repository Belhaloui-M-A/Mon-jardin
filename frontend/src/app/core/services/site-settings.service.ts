import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SiteSettings } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  settings = signal<SiteSettings | null>(null);

  constructor(private http: HttpClient) {}

  fetchSettings(): void {
    this.http.get<SiteSettings>('/api/settings').subscribe({
      next: (data) => this.settings.set(data),
      error: (err) => console.error('Failed to load settings', err)
    });
  }

  updateSettings(data: SiteSettings): Observable<SiteSettings> {
    return this.http.put<SiteSettings>('/api/settings', data).pipe(
      tap(updated => this.settings.set(updated))
    );
  }
}
