import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt?: string;
  };
}

interface AuthState {
  token: string;
  user: LoginResponse['user'];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://finance-backend-mobile.vercel.app/api';
  private readonly loginUrl = `${this.apiUrl}/auth/signin`;
  private readonly storageKey = 'acbr_auth_state';
  private stateSignal = signal<AuthState | null>(this.loadState());

  readonly estado = this.stateSignal.asReadonly();

  constructor(private http: HttpClient) {}

  autenticar(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { email, password }).pipe(
      tap((res) => {
        const state: AuthState = { token: res.token, user: res.user };
        this.stateSignal.set(state);
        localStorage.setItem(this.storageKey, JSON.stringify(state));
      })
    );
  }

  listarUsuarios(): Observable<{ count: number; users: any[] }> {
    return this.http.get<{ count: number; users: any[] }>(`${this.apiUrl}/auth/users`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  logout() {
    this.stateSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  get token(): string { return this.stateSignal()?.token ?? ''; }

  get user(): LoginResponse['user'] | null { return this.stateSignal()?.user ?? null; }

  get autenticado(): boolean { return !!this.stateSignal(); }

  private loadState(): AuthState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as AuthState : null;
    } catch {
      return null;
    }
  }
}
