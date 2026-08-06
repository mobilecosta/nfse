import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  private readonly apiUrl = 'https://hom.acbr.api.br';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = this.auth.token;
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

  listarNfse(cpfCnpj: string, ambiente: string = 'homologacao', top: number = 10, skip: number = 0, referencia?: string, chave?: string, serie?: string): Observable<any> {
    let params = new HttpParams()
      .set('cpf_cnpj', cpfCnpj)
      .set('ambiente', ambiente)
      .set('$top', top)
      .set('$skip', skip)
      .set('$inlinecount', 'true');
    if (referencia) params = params.set('referencia', referencia);
    if (chave) params = params.set('chave', chave);
    if (serie) params = params.set('serie', serie);
    return this.http.get(`${this.apiUrl}/nfse`, { ...this.getHeaders(), params });
  }

  consultarNfse(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/nfse/${id}`, this.getHeaders());
  }

  cancelarNfse(id: string, motivo: string, codigo?: string): Observable<any> {
    const body: any = { motivo };
    if (codigo) body.codigo = codigo;
    return this.http.post(`${this.apiUrl}/nfse/${id}/cancelamento`, body, this.getHeaders());
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
      headers: { 'Authorization': this.auth.token ? `Bearer ${this.auth.token}` : '' }
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
