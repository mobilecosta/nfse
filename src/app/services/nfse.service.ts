import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthToken {
  access_token: string;
  expires_in: number;
}

export interface NfseBody {
  provedor?: string;
  ambiente?: string;
  referencia?: string;
  infDPS?: {
    prest?: { CNPJ?: string; CPF?: string };
    toma?: { xNome?: string; end?: any };
    serv?: { cServ?: { CNAE?: string; xDescServ?: string } };
    valores?: { vServPrest?: { vServ?: number } };
  };
}

@Injectable({ providedIn: 'root' })
export class NfseService {
  private readonly authUrl = 'https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token';
  private readonly apiUrl = 'https://hom.acbr.api.br';
  private clientId = '1l7JPNYuvVqpJUtGW1Zi';
  private clientSecret = 'bINzBI5iyXU3kYu0BdhWY2wrDEkJQUCJ';
  private tokenSignal = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  setCredentials(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  getAuthToken(): Observable<AuthToken> {
    const params = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('scope', 'empresa nfse');
    return this.http.post<AuthToken>(this.authUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  setToken(token: string) { this.tokenSignal.set(token); }

  private getHeaders() {
    const token = this.tokenSignal();
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  }

  emitirNfse(body: NfseBody): Observable<any> {
    return this.http.post(`${this.apiUrl}/nfse/dps`, body, this.getHeaders());
  }

  listarNfse(cpfCnpj: string, ambiente: string = 'homologacao'): Observable<any> {
    const params = new HttpParams().set('cpf_cnpj', cpfCnpj).set('ambiente', ambiente);
    return this.http.get(`${this.apiUrl}/nfse`, { ...this.getHeaders(), params });
  }

  consultarNfse(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/nfse/${id}`, this.getHeaders());
  }

  cancelarNfse(id: string, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/nfse/${id}/cancelamento`, { motivo }, this.getHeaders());
  }

  baixarPdfNfse(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/nfse/${id}/pdf`, {
      ...this.getHeaders(),
      responseType: 'blob' as const
    });
  }

  baixarXmlNfse(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/nfse/${id}/xml`, this.getHeaders());
  }

  consultarCidadesAtendidas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/nfse/cidades`, this.getHeaders());
  }

  consultarMetadados(codigoIbge: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/nfse/cidades/${codigoIbge}`, this.getHeaders());
  }

  consultarEmpresa(cpfCnpj: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas/${cpfCnpj}`, this.getHeaders());
  }

  consultarCertificado(cpfCnpj: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas/${cpfCnpj}/certificado`, this.getHeaders());
  }

  cadastrarCertificado(cpfCnpj: string, certificadoBase64: string, password: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/empresas/${cpfCnpj}/certificado`, { certificado: certificadoBase64, password }, this.getHeaders());
  }

  uploadCertificado(cpfCnpj: string, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('Input', arquivo);
    return this.http.put(`${this.apiUrl}/empresas/${cpfCnpj}/certificado/upload`, formData, {
      headers: { 'Authorization': this.tokenSignal() ? `Bearer ${this.tokenSignal()}` : '' }
    });
  }

  excluirCertificado(cpfCnpj: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empresas/${cpfCnpj}/certificado`, this.getHeaders());
  }

  consultarConfigNfse(cpfCnpj: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas/${cpfCnpj}/nfse`, this.getHeaders());
  }

  salvarConfigNfse(cpfCnpj: string, config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/empresas/${cpfCnpj}/nfse`, config, this.getHeaders());
  }
}
