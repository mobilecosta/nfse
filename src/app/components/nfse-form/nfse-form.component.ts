import { Component, signal, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PoModule, PoPageAction, PoNotificationService, PoTableAction, PoTableColumn, PoModalComponent, PoModalAction } from '@po-ui/ng-components';
import { NfseService } from '../../services/nfse.service';

@Component({
  selector: 'app-nfse-form',
  templateUrl: './nfse-form.component.html',
  styleUrls: ['./nfse-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, PoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NfseFormComponent {
  nfseForm: FormGroup;
  carregando = signal(false);
  carregandoLista = signal(false);
  notas: any[] = [];
  totalNotas = 0;
  paginaAtual = 1;
  paginaTamanho = 10;
  notaSelecionada: any = null;
  motivoExclusao = '';

  @ViewChild('modalExclusao') modalExclusao!: PoModalComponent;
  @ViewChild('modalEmissao') modalEmissao!: PoModalComponent;

  readonly colunas: PoTableColumn[] = [
    { property: 'numero', label: 'Número' },
    { property: 'status', label: 'Status' },
    { property: 'referencia', label: 'Referência' },
    { property: 'data_emissao', label: 'Emissão', type: 'date' },
    { property: 'serieDps', label: 'Série DPS' },
    { property: 'numeroDps', label: 'Nº DPS' },
    { property: 'mensagensResumo', label: 'Mensagens' }
  ];

  constructor(
    private fb: FormBuilder,
    private nfseService: NfseService,
    private poNotification: PoNotificationService
  ) {
    this.nfseForm = this.fb.group({
      prestadorCpfCnpj: ['66549275000197', [Validators.required]],
      prestadorNome: ['', Validators.required],
      prestadorEmail: [''],
      prestadorTelefone: [''],
      tomadorCpfCnpj: ['', [Validators.required]],
      tomadorNome: ['', Validators.required],
      tomadorCep: [''],
      tomadorLogradouro: [''],
      tomadorNumero: [''],
      tomadorBairro: [''],
      tomadorCidade: [''],
      tomadorUf: [''],
      servicoCodigoCnae: [''],
      servicoDescricao: ['', Validators.required],
      servicoQuantidade: [1],
      servicoValorUnitario: [0],
      servicoAliquotaIss: [0]
    });
    this.listarNotas();
  }

  get f() { return this.nfseForm.controls; }

  get acoesNota(): PoTableAction[] {
    return [
      {
        label: 'Visualizar',
        icon: 'po-icon-eye',
        action: (row: any) => this.visualizarNota(row)
      },
      {
        label: 'Excluir',
        icon: 'po-icon-delete',
        action: (row: any) => this.iniciarExclusao(row)
      }
    ];
  }

  listarNotas() {
    const cpfCnpj = this.nfseForm.get('prestadorCpfCnpj')?.value || '66549275000197';
    this.carregandoLista.set(true);
    const skip = (this.paginaAtual - 1) * this.paginaTamanho;
    this.nfseService.listarNfse(cpfCnpj, 'homologacao', this.paginaTamanho, skip).subscribe({
      next: (res: any) => {
        this.notas = (res.data || []).map((n: any) => ({
          ...n,
          serieDps: n.DPS?.serie ?? '',
          numeroDps: n.DPS?.nDPS ?? '',
          mensagensResumo: (n.mensagens || []).map((m: any) => `${m.codigo}: ${m.descricao}`).join(' | ')
        }));
        this.totalNotas = res['@count'] ?? this.notas.length;
        this.carregandoLista.set(false);
      },
      error: (error: any) => {
        this.carregandoLista.set(false);
        this.poNotification.error('Erro ao listar notas: ' + (error.error?.message || error.statusText));
      }
    });
  }

  carregarMais() {
    if (this.notas.length >= this.totalNotas) return;
    this.paginaAtual++;
    const skip = (this.paginaAtual - 1) * this.paginaTamanho;
    this.carregandoLista.set(true);
    const cpfCnpj = this.nfseForm.get('prestadorCpfCnpj')?.value || '66549275000197';
    this.nfseService.listarNfse(cpfCnpj, 'homologacao', this.paginaTamanho, skip).subscribe({
      next: (res: any) => {
        this.notas = [
          ...this.notas,
          ...(res.data || []).map((n: any) => ({
            ...n,
            serieDps: n.DPS?.serie ?? '',
            numeroDps: n.DPS?.nDPS ?? '',
            mensagensResumo: (n.mensagens || []).map((m: any) => `${m.codigo}: ${m.descricao}`).join(' | ')
          }))
        ];
        this.totalNotas = res['@count'] ?? this.notas.length;
        this.carregandoLista.set(false);
      },
      error: (error: any) => {
        this.carregandoLista.set(false);
        this.poNotification.error('Erro ao listar notas: ' + (error.error?.message || error.statusText));
      }
    });
  }

  incluirNota() {
    this.notaSelecionada = null;
    this.nfseForm.reset({
      prestadorCpfCnpj: '66549275000197',
      servicoQuantidade: 1,
      servicoValorUnitario: 0,
      servicoAliquotaIss: 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  visualizarNota(nota: any) {
    this.notaSelecionada = nota;
    this.carregando.set(true);
    this.nfseService.consultarNfse(nota.id).subscribe({
      next: (detalhe: any) => {
        this.carregando.set(false);
        this.preencherFormulario(detalhe);
        this.poNotification.information(`Dados da nota ${nota.id} carregados para visualização.`);
        this.modalEmissao?.open();
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.poNotification.error('Erro ao carregar nota: ' + (error.error?.message || error.statusText));
      }
    });
  }

  private preencherFormulario(nota: any) {
    const dps = nota.infDPS || nota.declaracao_prestacao_servico || {};
    const toma = dps.toma || {};
    const end = toma.end || {};
    const serv = dps.serv || {};
    const valores = dps.valores || {};
    const trib = valores.trib?.tribMun || {};
    this.nfseForm.patchValue({
      prestadorCpfCnpj: dps.prest?.CNPJ || dps.prest?.CPF || '66549275000197',
      prestadorNome: dps.prest?.xNome || '',
      prestadorEmail: dps.prest?.email || '',
      prestadorTelefone: dps.prest?.fone || '',
      tomadorCpfCnpj: toma.CNPJ || toma.CPF || '',
      tomadorNome: toma.xNome || '',
      tomadorCep: end.CEP || '',
      tomadorLogradouro: end.xLgr || '',
      tomadorNumero: end.nro || '',
      tomadorBairro: end.xBairro || '',
      tomadorCidade: end.endNac?.xMun || '',
      tomadorUf: end.uf || '',
      servicoCodigoCnae: serv.cServ?.CNAE || '',
      servicoDescricao: serv.cServ?.xDescServ || '',
      servicoValorUnitario: valores.vServPrest?.vServ || 0,
      servicoAliquotaIss: trib.pAliq || 0
    });
  }

  get confirmarExclusaoAction(): PoModalAction {
    return { label: 'Excluir', action: () => this.confirmarExclusao() };
  }

  get cancelarExclusaoAction(): PoModalAction {
    return { label: 'Cancelar', action: () => this.modalExclusao?.close() };
  }

  get acoesModalEmissao(): PoModalAction {
    return { label: 'Emitir NFS-e', action: () => this.emitirNfse() };
  }

  get cancelarModalEmissaoAction(): PoModalAction {
    return { label: 'Cancelar', action: () => this.modalEmissao?.close() };
  }

  iniciarExclusao(nota: any) {
    this.notaSelecionada = nota;
    this.motivoExclusao = '';
    this.modalExclusao?.open();
  }

  confirmarExclusao() {
    if (!this.notaSelecionada) return;
    this.carregando.set(true);
    const motivo = this.motivoExclusao || 'Cancelamento solicitado pelo usuário';
    this.nfseService.cancelarNfse(this.notaSelecionada.id, motivo).subscribe({
      next: (res: any) => {
        this.carregando.set(false);
        this.modalExclusao?.close();
        this.notaSelecionada = null;
        this.poNotification.success('Nota excluída (cancelamento) com sucesso.');
        this.listarNotas();
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.poNotification.error('Erro ao excluir nota: ' + (error.error?.message || error.statusText));
      }
    });
  }

  emitirNfse() {
    if (this.nfseForm.invalid) {
      this.nfseForm.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    const form = this.nfseForm.value;
    const body = {
      provedor: 'padrao',
      ambiente: 'homologacao',
      referencia: `NFS-${Date.now()}`,
      infDPS: {
        prest: {
          CPF: form.prestadorCpfCnpj.length <= 11 ? form.prestadorCpfCnpj : undefined,
          CNPJ: form.prestadorCpfCnpj.length > 11 ? form.prestadorCpfCnpj : undefined
        },
        toma: {
          CNPJ: form.tomadorCpfCnpj.length > 11 ? form.tomadorCpfCnpj : undefined,
          CPF: form.tomadorCpfCnpj.length <= 11 ? form.tomadorCpfCnpj : undefined,
          xNome: form.tomadorNome,
          end: {
            endNac: { cMun: '3550308', CEP: form.tomadorCep },
            xLgr: form.tomadorLogradouro,
            nro: form.tomadorNumero,
            xBairro: form.tomadorBairro
          }
        },
        serv: {
          cServ: { CNAE: form.servicoCodigoCnae, xDescServ: form.servicoDescricao }
        },
        valores: {
          vServPrest: { vServ: form.servicoQuantidade * form.servicoValorUnitario },
          trib: {
            tribMun: {
              tribISSQN: 1,
              pAliq: form.servicoAliquotaIss || 0,
              vISSQN: +(form.servicoQuantidade * form.servicoValorUnitario * (form.servicoAliquotaIss || 0) / 100).toFixed(2),
              cLocIncid: '3550308'
            }
          }
        }
      }
    };
    this.nfseService.emitirNfse(body).subscribe({
      next: (response: any) => {
        this.carregando.set(false);
        this.modalEmissao?.close();
        this.poNotification.success('NFS-e emitida! ID: ' + response.id);
        this.listarNotas();
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.poNotification.error('Erro: ' + (error.error?.message || error.statusText));
      }
    });
  }

  consultarCep() {
    const cep = this.f['tomadorCep'].value;
    if (cep && cep.length >= 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(data => {
          if (!data.erro) {
            this.nfseForm.patchValue({
              tomadorLogradouro: data.logradouro,
              tomadorBairro: data.bairro,
              tomadorCidade: data.localidade,
              tomadorUf: data.uf
            });
          }
        });
    }
  }

  acoesPrincipais(): PoPageAction[] {
    return [{ label: 'Emitir NFS-e', icon: 'po-icon-ok', action: () => this.modalEmissao?.open() }];
  }

  acoesSecundarias(): PoPageAction[] {
    return [{ label: 'Nova Nota', icon: 'po-icon-plus', action: () => this.incluirNota() }];
  }
}
