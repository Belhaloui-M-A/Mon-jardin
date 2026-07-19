import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { AuthResponse } from '../models/models';

/**
 * Bonne pratique Angular :
 * - Les tokens restent dans les cookies HttpOnly (jamais dans localStorage/sessionStorage)
 * - L'état utilisateur est stocké dans un signal Angular 19
 * - Le refresh est géré par l'intercepteur automatiquement
 * - Pas de token dans le code Angular, uniquement l'état utilisateur
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = '/api/auth';

  // Signal pour l'état utilisateur courant (null = non connecté)
  private _currentUser = signal<AuthResponse | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isClient = computed(() => this._currentUser()?.role === 'CLIENT');

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password })
      .pipe(tap(user => this.setUser(user)));
  }

  register(data: {
    firstName: string; lastName: string;
    email: string; password: string;
    phone?: string; address?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data)
      .pipe(tap(user => this.setUser(user)));
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe({
      complete: () => this.clearSession()
    });
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/refresh`, {})
      .pipe(
        tap(user => this.setUser(user)),
        catchError(err => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }

  private setUser(user: AuthResponse): void {
    this._currentUser.set(user);
    // On ne stocke PAS le token, juste les infos d'affichage
    sessionStorage.setItem('pv_user', JSON.stringify(user));
  }

  private clearSession(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem('pv_user');
    this.router.navigate(['/auth/login']);
  }

  private loadFromStorage(): AuthResponse | null {
    try {
      const raw = sessionStorage.getItem('pv_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
