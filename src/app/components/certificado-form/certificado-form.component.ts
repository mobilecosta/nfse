import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PoModule } from '@po-ui/ng-components';
import { NfseService } from '../../services/nfse.service';

@Component({
  selector: 'app-certificado-form',
  templateUrl: './certificado-form.component.html',
  styleUrls: ['./certificado-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CertificadoFormComponent {
  certForm: FormGroup;
  arquivoSelecionado: File | null = null;
  carregando = signal(false);
  mensagem = signal('');
  erro = signal('');
  certificadoAtual = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private nfseService: NfseService
  ) {
    this.certForm = this.fb.group({
      cpfCnpj: ['66549275000197', [Validators.required]],
      password: ['', [Validators.required]],
      serieRps: [''],
      loteRps: [1],
      numeroRps: [1]
    });
  }

  get f() { return this.certForm.controls; }

  onArquivoSelecionado(event: any): void {
    const file = event?.target?.files?.[0] || event?.srcElement?.files?.[0];
    if (!file) return;
    this.arquivoSelecionado = file;
    this.erro.set('');
  }

  onArquivoSolto(arquivos: File[]): void {
    if (arquivos?.length) {
      this.arquivoSelecionado = arquivos[0];
      this.erro.set('');
    }
  }

  consultarCertificado(): void {
    const cnpj = this.f['cpfCnpj'].value?.replace(/\D/g, '');
    if (!cnpj) return;
    this.carregando.set(true);
    this.nfseService.consultarCertificado(cnpj).subscribe({
      next: (cert: any) => {
        this.certificadoAtual.set(cert);
        this.erro.set('');
        this.mensagem.set(`Certificado: ${cert.subject_name} | válido até ${cert.not_valid_after}`);
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.certificadoAtual.set(null);
        this.mensagem.set('');
        this.erro.set(err.status === 404
          ? 'Nenhum certificado cadastrado para este CNPJ.'
          : (err.error?.message || err.statusText || 'Erro ao consultar certificado.'));
        this.carregando.set(false);
      }
    });
  }

  uploadCertificado(): void {
    if (this.certForm.invalid || !this.arquivoSelecionado) {
      this.erro.set('Informe o CNPJ, a senha do certificado e selecione o arquivo PFX.');
      return;
    }
    this.carregando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    const cnpj = this.f['cpfCnpj'].value.replace(/\D/g, '');
    this.nfseService.uploadCertificado(cnpj, this.arquivoSelecionado).subscribe({
      next: () => {
        this.mensagem.set('Certificado enviado com sucesso. Salvando senha...');
        this.cadastrarSenha(cnpj);
      },
      error: (err: any) => {
        this.erro.set(err.error?.message || err.statusText || 'Erro no upload do certificado.');
        this.carregando.set(false);
      }
    });
  }

  private cadastrarSenha(cnpj: string): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(',')[1] || String(reader.result);
      this.nfseService.cadastrarCertificado(cnpj, base64, this.f['password'].value).subscribe({
        next: () => {
          this.mensagem.set('Certificado cadastrado com sucesso!');
          this.carregando.set(false);
          this.consultarCertificado();
        },
        error: (err: any) => {
          this.erro.set(err.error?.message || err.statusText || 'Erro ao cadastrar senha do certificado.');
          this.carregando.set(false);
        }
      });
    };
    reader.onerror = () => {
      this.erro.set('Não foi possível ler o arquivo PFX.');
      this.carregando.set(false);
    };
    reader.readAsDataURL(this.arquivoSelecionado as File);
  }

  salvarConfigNfse(): void {
    const cnpj = this.f['cpfCnpj'].value?.replace(/\D/g, '');
    if (!cnpj) return;
    const config = {
      rps: {
        serie: this.f['serieRps'].value || 'NF',
        lote: Number(this.f['loteRps'].value || 1),
        numero: Number(this.f['numeroRps'].value || 1)
      },
      ambiente: 'homologacao'
    };
    this.carregando.set(true);
    this.nfseService.salvarConfigNfse(cnpj, config).subscribe({
      next: () => {
        this.mensagem.set('Configuração NFS-e salva com sucesso!');
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.erro.set(err.error?.message || err.statusText || 'Erro ao salvar configuração NFS-e.');
        this.carregando.set(false);
      }
    });
  }

  excluirCertificado(): void {
    const cnpj = this.f['cpfCnpj'].value?.replace(/\D/g, '');
    if (!cnpj || !confirm('Excluir o certificado desta empresa?')) return;
    this.carregando.set(true);
    this.nfseService.excluirCertificado(cnpj).subscribe({
      next: () => {
        this.certificadoAtual.set(null);
        this.mensagem.set('Certificado excluído.');
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.erro.set(err.error?.message || err.statusText || 'Erro ao excluir certificado.');
        this.carregando.set(false);
      }
    });
  }
}
