import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<boolean>(false);

/**
 * Intercepteur fonctionnel Angular 19 (pas de classe)
 * Bonne pratique :
 * - withCredentials = true sur toutes les requêtes API (envoie les cookies)
 * - Sur 401 → tente un refresh silencieux (token rotation)
 * - Si refresh échoue → redirige vers login
 * - File d'attente des requêtes en attente du refresh (pas de cascades)
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ajoute withCredentials à toutes les requêtes /api
  const authReq = req.url.includes('/api')
    ? req.clone({ withCredentials: true })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignore les erreurs sur les routes auth (évite boucle infinie)
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return handle401(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  if (isRefreshing) {
    // Attendre que le refresh en cours se termine
    return refreshSubject.pipe(
      filter(done => done),
      take(1),
      switchMap(() => next(req))
    );
  }

  isRefreshing = true;
  refreshSubject.next(false);

  return authService.refresh().pipe(
    switchMap(() => {
      isRefreshing = false;
      refreshSubject.next(true);
      return next(req);
    }),
    catchError(err => {
      isRefreshing = false;
      refreshSubject.next(false);
      router.navigate(['/auth/login']);
      return throwError(() => err);
    })
  );
}
