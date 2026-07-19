import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

/**
 * Vérifie que les guards autorisent/bloquent et redirigent correctement
 * selon l'état d'authentification et le rôle.
 */
describe('auth guards', () => {
  let auth: { isLoggedIn: () => boolean; isAdmin: () => boolean };
  let router: jasmine.SpyObj<Router>;

  function run(guard: CanActivateFn) {
    return TestBed.runInInjectionContext(() => guard({} as any, {} as any));
  }

  beforeEach(() => {
    auth = { isLoggedIn: () => false, isAdmin: () => false };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('authGuard autorise un utilisateur connecté', () => {
    auth.isLoggedIn = () => true;
    expect(run(authGuard)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('authGuard bloque et redirige vers /auth/login si non connecté', () => {
    auth.isLoggedIn = () => false;
    expect(run(authGuard)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('adminGuard autorise uniquement un admin', () => {
    auth.isAdmin = () => true;
    expect(run(adminGuard)).toBeTrue();
  });

  it('adminGuard redirige un non-admin vers la racine', () => {
    auth.isAdmin = () => false;
    expect(run(adminGuard)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('guestGuard bloque un utilisateur déjà connecté', () => {
    auth.isLoggedIn = () => true;
    auth.isAdmin = () => false;
    expect(run(guestGuard)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/catalogue']);
  });

  it('guestGuard autorise un visiteur anonyme', () => {
    auth.isLoggedIn = () => false;
    expect(run(guestGuard)).toBeTrue();
  });
});
