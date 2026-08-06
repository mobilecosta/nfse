import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthToken {
  access_token: string;
  expires_in: number;
}

interface AuthState {
  clientId: string;
  clientSecret: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = 'https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token';
  private readonly storageKey = 'acbr_auth_state';
  private stateSignal = signal<AuthState | null>(this.loadState());

  readonly estado = this.stateSignal.asReadonly();

  constructor(private http: HttpClient) {}

  autenticar(clientId: string, clientSecret: string): Observable<AuthToken> {
    const params = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', clientId)
      .set('client_secret', clientSecret)
      .set('scope', 'empresa nfse');
    return this.http.post<AuthToken>(this.authUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((res) => {
        const state: AuthState = { clientId, clientSecret, token: res.access_token };
        this.stateSignal.set(state);
        localStorage.setItem(this.storageKey, JSON.stringify(state));
      })
    );
  }

  logout() {
    this.stateSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  get token(): string { return this.stateSignal()?.token ?? ''; }

  get clientId(): string { return this.stateSignal()?.clientId ?? ''; }

  get clientSecret(): string { return this.stateSignal()?.clientSecret ?? ''; }

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
