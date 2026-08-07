import { Component, signal, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PoModule, PoPageAction, PoNotificationService, PoTableAction, PoTableColumn, PoModalComponent, PoModalAction, PoTabsComponent } from '@po-ui/ng-components';
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
  modoVisualizacao = false;
  ordenarPor: 'numero' | 'data' = 'data';
  ordenarDirecao: 'asc' | 'desc' = 'desc';

  @ViewChild('modalExclusao') modalExclusao!: PoModalComponent;
  @ViewChild('modalEmissao') modalEmissao!: PoModalComponent;
  @ViewChild('tabsEmissao') tabsEmissao!: PoTabsComponent;

  private readonly abaPorCampo: Record<string, string> = {
    prestadorCpfCnpj: 'obrigatorios',
    tomadorCpfCnpj: 'obrigatorios',
    tomadorNome: 'obrigatorios',
    tomadorCep: 'obrigatorios',
    tomadorLogradouro: 'obrigatorios',
    tomadorNumero: 'obrigatorios',
    tomadorBairro: 'obrigatorios',
    tomadorCodigoMunicipio: 'obrigatorios',
    tomadorUf: 'obrigatorios',
    servicoCodigoTributacao: 'obrigatorios',
    servicoDescricao: 'obrigatorios',
    servicoQuantidade: 'obrigatorios',
    servicoValorUnitario: 'obrigatorios',
    servicoAliquotaIss: 'obrigatorios',
    tributacaoIssqn: 'obrigatorios',
    localIncidencia: 'obrigatorios',
    prestadorNome: 'prestador',
    prestadorEmail: 'prestador',
    prestadorTelefone: 'prestador',
    prestadorInscricaoMunicipal: 'prestador',
    prestadorCep: 'prestador',
    prestadorLogradouro: 'prestador',
    prestadorNumero: 'prestador',
    prestadorComplemento: 'prestador',
    prestadorBairro: 'prestador',
    prestadorCidade: 'prestador',
    prestadorUf: 'prestador',
    tomadorEmail: 'tomador',
    tomadorTelefone: 'tomador',
    tomadorComplemento: 'tomador',
    tomadorInscricaoMunicipal: 'tomador',
    tomadorInscricaoEstadual: 'tomador',
    tomadorNif: 'tomador',
    tomadorCaepf: 'tomador',
    intermCpfCnpj: 'tomador',
    intermNome: 'tomador',
    servicoCodigoCnae: 'servico',
    servicoCodigoTributacaoMunicipal: 'servico',
    servicoNbs: 'servico',
    servicoNaturezaOperacao: 'servico',
    servicoSituacaoTributaria: 'servico',
    retencaoIssqn: 'servico',
    valorDescontoIncondicionado: 'valores',
    valorDescontoCondicionado: 'valores',
    deducaoValor: 'valores',
    deducaoPercentual: 'valores',
    retencaoCp: 'valores',
    retencaoIrrf: 'valores',
    retencaoCsll: 'valores',
    valorBaseCalculo: 'valores',
    valorIss: 'valores',
    valorLiquido: 'valores'
  };

  readonly colunas: PoTableColumn[] = [
    { property: 'numero', label: 'Número' },
    { property: 'data_emissao', label: 'Emissão', type: 'date' },
    { property: 'status', label: 'Status' },
    { property: 'ambiente', label: 'Ambiente' },
    { property: 'referencia', label: 'Referência' },
    { property: 'serieDps', label: 'Série DPS' },
    { property: 'numeroDps', label: 'Nº DPS' },
    { property: 'codigoVerificacao', label: 'Cód. Verificação' },
    { property: 'mensagensResumo', label: 'Mensagens' }
  ];

  constructor(
    private fb: FormBuilder,
    private nfseService: NfseService,
    private poNotification: PoNotificationService
  ) {
    this.nfseForm = this.fb.group({
      prestadorCpfCnpj: ['66549275000197', [Validators.required]],
      prestadorNome: [''],
      prestadorEmail: [''],
      prestadorTelefone: [''],
      prestadorInscricaoMunicipal: [''],
      prestadorCep: [''],
      prestadorLogradouro: [''],
      prestadorNumero: [''],
      prestadorComplemento: [''],
      prestadorBairro: [''],
      prestadorCidade: [''],
      prestadorUf: [''],
      tomadorCpfCnpj: ['', [Validators.required]],
      tomadorNome: ['', [Validators.required]],
      tomadorCep: [''],
      tomadorLogradouro: [''],
      tomadorNumero: [''],
      tomadorComplemento: [''],
      tomadorBairro: [''],
      tomadorCidade: [''],
      tomadorCodigoMunicipio: [''],
      tomadorUf: [''],
      tomadorEmail: [''],
      tomadorTelefone: [''],
      tomadorInscricaoMunicipal: [''],
      tomadorInscricaoEstadual: [''],
      tomadorNif: [''],
      tomadorCaepf: [''],
      intermCpfCnpj: [''],
      intermNome: [''],
      servicoCodigoCnae: [''],
      servicoCodigoTributacao: ['010701', [Validators.required]],
      servicoCodigoTributacaoMunicipal: [''],
      servicoNbs: [''],
      servicoNaturezaOperacao: [''],
      servicoSituacaoTributaria: [''],
      servicoDescricao: ['', [Validators.required]],
      servicoQuantidade: [1, [Validators.required, Validators.min(1)]],
      servicoValorUnitario: [0, [Validators.required, Validators.min(0.01)]],
      servicoAliquotaIss: [0, [Validators.required, Validators.min(0)]],
      tributacaoIssqn: [1, [Validators.required]],
      retencaoIssqn: [1],
      localIncidencia: ['3550308'],
      valorDescontoIncondicionado: [0],
      valorDescontoCondicionado: [0],
      deducaoValor: [0],
      deducaoPercentual: [0],
      retencaoCp: [0],
      retencaoIrrf: [0],
      retencaoCsll: [0],
      valorBaseCalculo: [0],
      valorIss: [0],
      valorLiquido: [0]
    });
    this.carregarListaComToken();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalNotas / this.paginaTamanho));
  }

  get tituloModal(): string {
    if (this.modoVisualizacao) {
      return `NFS-e ${this.notaSelecionada?.referencia || this.notaSelecionada?.id || ''}`;
    }
    return 'Emitir NFS-e';
  }

  private carregarListaComToken() {
    this.carregandoLista.set(true);
    this.nfseService.garantirTokenAcbr().subscribe({
      next: () => this.listarNotas(),
      error: (error: any) => {
        this.carregandoLista.set(false);
        this.poNotification.error('Erro ao obter token ACBr: ' + (error.error?.message || error.statusText || 'não foi possível autenticar'));
      }
    });
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
          numero: n.numero || n.DPS?.nDPS || '',
          data_emissao: n.data_emissao || n.created_at,
          ambiente: n.ambiente || '',
          codigoVerificacao: n.codigo_verificacao || '',
          serieDps: n.DPS?.serie ?? '',
          numeroDps: n.DPS?.nDPS ?? '',
          mensagensResumo: (n.mensagens || []).map((m: any) => `${m.codigo}: ${m.descricao}`).join(' | ')
        }));
        this.ordenarNotas();
        this.totalNotas = res['@count'] ?? this.notas.length;
        this.carregandoLista.set(false);
      },
      error: (error: any) => {
        this.carregandoLista.set(false);
        this.poNotification.error('Erro ao listar notas: ' + (error.error?.message || error.statusText));
      }
    });
  }

  irParaPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) return;
    this.paginaAtual = pagina;
    this.listarNotas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior() { this.irParaPagina(this.paginaAtual - 1); }
  paginaProxima() { this.irParaPagina(this.paginaAtual + 1); }

  readonly opcoesOrdenacao = [
    { label: 'Número da nota', value: 'numero' },
    { label: 'Data de emissão', value: 'data' }
  ];

  aplicarOrdenacao(campo: any) {
    this.ordenarPor = campo === 'numero' ? 'numero' : 'data';
    this.ordenarDirecao = this.ordenarPor === 'data' ? 'desc' : 'asc';
    this.ordenarNotas();
  }

  private ordenarNotas() {
    const dir = this.ordenarDirecao === 'asc' ? 1 : -1;
    this.notas.sort((a: any, b: any) => {
      if (this.ordenarPor === 'numero') {
        const na = parseInt(a.numero, 10) || 0;
        const nb = parseInt(b.numero, 10) || 0;
        return (na - nb) * dir;
      }
      const da = new Date(a.data_emissao || a.created_at).getTime() || 0;
      const db = new Date(b.data_emissao || b.created_at).getTime() || 0;
      return (da - db) * dir;
    });
  }

  incluirNota() {
    this.modoVisualizacao = false;
    this.notaSelecionada = null;
    this.nfseForm.reset({
      prestadorCpfCnpj: '66549275000197',
      servicoCodigoTributacao: '010701',
      servicoQuantidade: 1,
      servicoValorUnitario: 0,
      servicoAliquotaIss: 0,
      tributacaoIssqn: 1,
      retencaoIssqn: 1,
      localIncidencia: '3550308',
      valorDescontoIncondicionado: 0,
      valorDescontoCondicionado: 0,
      deducaoValor: 0,
      deducaoPercentual: 0,
      retencaoCp: 0,
      retencaoIrrf: 0,
      retencaoCsll: 0,
      valorBaseCalculo: 0,
      valorIss: 0,
      valorLiquido: 0
    });
    this.modalEmissao?.open();
  }

  abrirEmissao() {
    this.modoVisualizacao = false;
    if (!this.nfseForm.get('prestadorCpfCnpj')?.value) {
      this.nfseForm.patchValue({ prestadorCpfCnpj: '66549275000197' });
    }
    this.modalEmissao?.open();
  }

  visualizarNota(nota: any) {
    this.notaSelecionada = nota;
    this.carregando.set(true);
    this.nfseService.consultarNfse(nota.id).subscribe({
      next: (detalhe: any) => {
        this.carregando.set(false);
        this.modoVisualizacao = true;
        this.preencherFormulario(detalhe);
        this.modalEmissao?.open();
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.poNotification.error('Erro ao carregar nota: ' + (error.error?.message || error.statusText));
      }
    });
  }

  private preencherFormulario(nota: any) {
    const rps = nota.declaracao_prestacao_servico || {};
    const dps = nota.infDPS || {};
    const pres = dps.prest || {};
    const toma = dps.toma || rps.tomador || {};
    const interm = dps.interm || rps.intermediario || {};
    const end = toma.end || rps.tomador?.endereco || {};
    const endPrest = pres.end || rps.prestador?.endereco || {};
    const serv = dps.serv?.cServ || {};
    const valores = dps.valores || {};
    const tribMun = valores.trib?.tribMun || {};
    const tribFed = valores.trib?.tribFed || {};
    const vServPrest = valores.vServPrest || {};
    const vDesc = valores.vDescCondIncond || {};
    const vDedRed = valores.vDedRed || {};
    const servicoRps = (rps.servicos || [])[0] || {};
    const endNac = end.endNac || {};

    this.nfseForm.patchValue({
      prestadorCpfCnpj: pres.CNPJ || pres.CPF || rps.prestador?.cpf_cnpj || '66549275000197',
      prestadorNome: pres.xNome || rps.prestador?.nome_razao_social || rps.prestador?.nome_fantasia || '',
      prestadorEmail: pres.email || rps.prestador?.email || '',
      prestadorTelefone: pres.fone || rps.prestador?.fone || '',
      prestadorInscricaoMunicipal: rps.prestador?.inscricao_municipal || '',
      prestadorCep: endPrest.CEP || endPrest.endNac?.CEP || rps.prestador?.endereco?.cep || '',
      prestadorLogradouro: endPrest.xLgr || rps.prestador?.endereco?.logradouro || '',
      prestadorNumero: endPrest.nro || rps.prestador?.endereco?.numero || '',
      prestadorComplemento: endPrest.xCpl || rps.prestador?.endereco?.complemento || '',
      prestadorBairro: endPrest.xBairro || rps.prestador?.endereco?.bairro || '',
      prestadorCidade: endPrest.endNac?.cMun || rps.prestador?.endereco?.cidade || '',
      prestadorUf: rps.prestador?.endereco?.uf || '',
      tomadorCpfCnpj: toma.CNPJ || toma.CPF || toma.NIF || rps.tomador?.cpf_cnpj || '',
      tomadorNome: toma.xNome || rps.tomador?.nome_razao_social || '',
      tomadorCep: endNac.CEP || end.CEP || rps.tomador?.endereco?.cep || '',
      tomadorLogradouro: end.xLgr || rps.tomador?.endereco?.logradouro || '',
      tomadorNumero: end.nro || rps.tomador?.endereco?.numero || '',
      tomadorComplemento: end.xCpl || rps.tomador?.endereco?.complemento || '',
      tomadorBairro: end.xBairro || rps.tomador?.endereco?.bairro || '',
      tomadorCidade: endNac.cMun || rps.tomador?.endereco?.cidade || '',
      tomadorCodigoMunicipio: endNac.cMun || rps.tomador?.endereco?.codigo_municipio || '',
      tomadorUf: end.uf || rps.tomador?.endereco?.uf || '',
      tomadorEmail: toma.email || rps.tomador?.email || '',
      tomadorTelefone: toma.fone || rps.tomador?.fone || '',
      tomadorInscricaoMunicipal: toma.IM || rps.tomador?.inscricao_municipal || '',
      tomadorInscricaoEstadual: toma.IE || '',
      tomadorNif: toma.NIF || '',
      tomadorCaepf: toma.CAEPF || '',
      intermCpfCnpj: interm.CNPJ || interm.CPF || interm.NIF || rps.intermediario?.cpf_cnpj || '',
      intermNome: interm.xNome || rps.intermediario?.nome_razao_social || '',
      servicoCodigoCnae: serv.CNAE || servicoRps.codigo_cnae || '',
      servicoCodigoTributacao: serv.cTribNac || servicoRps.codigo_tributacao || '010701',
      servicoCodigoTributacaoMunicipal: serv.cTribMun || '',
      servicoNbs: serv.cNBS || '',
      servicoNaturezaOperacao: serv.cNatOp || '',
      servicoSituacaoTributaria: serv.cSitTrib || '',
      servicoDescricao: serv.xDescServ || servicoRps.descricao || '',
      servicoQuantidade: servicoRps.quantidade || 1,
      servicoValorUnitario: servicoRps.valor_unitario ?? vServPrest.vServ ?? 0,
      servicoAliquotaIss: tribMun.pAliq ?? servicoRps.aliquota_iss ?? 0,
      tributacaoIssqn: tribMun.tribISSQN ?? 1,
      retencaoIssqn: tribMun.tpRetISSQN ?? 1,
      localIncidencia: tribMun.cLocIncid || '3550308',
      valorDescontoIncondicionado: vDesc.vDescIncond ?? servicoRps.desconto_incondicionado ?? 0,
      valorDescontoCondicionado: vDesc.vDescCond ?? servicoRps.desconto_condicionado ?? 0,
      deducaoValor: vDedRed.vDR ?? servicoRps.valor_deducoes ?? 0,
      deducaoPercentual: vDedRed.pDR ?? 0,
      retencaoCp: tribFed.vRetCP ?? servicoRps.valor_pis ?? 0,
      retencaoIrrf: tribFed.vRetIRRF ?? servicoRps.valor_ir ?? 0,
      retencaoCsll: tribFed.vRetCSLL ?? servicoRps.valor_csll ?? 0,
      valorBaseCalculo: tribMun.vBC ?? servicoRps.valor_servicos ?? 0,
      valorIss: tribMun.vISSQN ?? servicoRps.valor_iss ?? 0,
      valorLiquido: tribMun.vLiq ?? servicoRps.valor_liquido ?? 0
    });
  }

  get confirmarExclusaoAction(): PoModalAction {
    return { label: 'Excluir', action: () => this.confirmarExclusao() };
  }

  get cancelarExclusaoAction(): PoModalAction {
    return { label: 'Cancelar', action: () => this.modalExclusao?.close() };
  }

  get acoesModalEmissao(): PoModalAction {
    if (this.modoVisualizacao) {
      return { label: 'Fechar', action: () => this.modalEmissao?.close() };
    }
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
      const primeiroErro = Object.keys(this.abaPorCampo)
        .find(campo => this.nfseForm.get(campo)?.invalid);
      if (primeiroErro) {
        const aba = this.abaPorCampo[primeiroErro];
        setTimeout(() => this.tabsEmissao?.activateTab(aba), 0);
      }
      this.poNotification.warning('Preencha corretamente os campos obrigatórios para emitir a NFS-e.');
      return;
    }
    this.carregando.set(true);
    const form = this.nfseForm.value;
    const ehCnpj = (v: string) => v && v.replace(/\D/g, '').length > 11;
    const cpfCnpjPrest = form.prestadorCpfCnpj?.replace(/\D/g, '') || '';
    const cpfCnpjTom = form.tomadorCpfCnpj?.replace(/\D/g, '') || '';
    const cpfCnpjInterm = form.intermCpfCnpj?.replace(/\D/g, '') || '';

    const tomarNumero = (v: any) => (v !== null && v !== undefined && v !== '') ? v : undefined;

    const body: any = {
      provedor: 'padrao',
      ambiente: 'homologacao',
      referencia: `NFS-${Date.now()}`,
      infDPS: {
        dhEmi: new Date().toISOString(),
        prest: {
          CNPJ: ehCnpj(cpfCnpjPrest) ? cpfCnpjPrest : undefined,
          CPF: !ehCnpj(cpfCnpjPrest) ? cpfCnpjPrest : undefined
        },
        toma: {
          CNPJ: ehCnpj(cpfCnpjTom) ? cpfCnpjTom : undefined,
          CPF: !ehCnpj(cpfCnpjTom) ? cpfCnpjTom : undefined,
          NIF: tomarNumero(form.tomadorNif),
          xNome: form.tomadorNome,
          fone: tomarNumero(form.tomadorTelefone),
          email: tomarNumero(form.tomadorEmail),
          IM: tomarNumero(form.tomadorInscricaoMunicipal),
          IE: tomarNumero(form.tomadorInscricaoEstadual),
          CAEPF: tomarNumero(form.tomadorCaepf),
          end: {
            endNac: {
              cMun: tomarNumero(form.tomadorCodigoMunicipio) || undefined,
              CEP: form.tomadorCep?.replace(/\D/g, '') || undefined
            },
            xLgr: tomarNumero(form.tomadorLogradouro),
            nro: tomarNumero(form.tomadorNumero),
            xCpl: tomarNumero(form.tomadorComplemento),
            xBairro: tomarNumero(form.tomadorBairro)
          }
        },
        serv: {
          cServ: {
            cTribNac: form.servicoCodigoTributacao,
            cTribMun: tomarNumero(form.servicoCodigoTributacaoMunicipal),
            CNAE: tomarNumero(form.servicoCodigoCnae),
            xDescServ: form.servicoDescricao,
            cNBS: tomarNumero(form.servicoNbs),
            cNatOp: tomarNumero(form.servicoNaturezaOperacao),
            cSitTrib: tomarNumero(form.servicoSituacaoTributaria)
          }
        },
        valores: {
          vServPrest: { vServ: +(form.servicoQuantidade * form.servicoValorUnitario).toFixed(2) },
          trib: {
            tribMun: {
              tribISSQN: form.tributacaoIssqn || 1,
              tpRetISSQN: form.retencaoIssqn || 1,
              pAliq: form.servicoAliquotaIss || 0,
              cLocIncid: form.localIncidencia || '3550308'
            }
          }
        }
      }
    };

    if (form.valorDescontoIncondicionado) body.infDPS.valores.vDescCondIncond = { vDescIncond: +form.valorDescontoIncondicionado };
    if (form.valorDescontoCondicionado) {
      body.infDPS.valores.vDescCondIncond = { ...(body.infDPS.valores.vDescCondIncond || {}), vDescCond: +form.valorDescontoCondicionado };
    }
    if (form.deducaoValor || form.deducaoPercentual) {
      body.infDPS.valores.vDedRed = {
        vDR: tomarNumero(form.deducaoValor),
        pDR: tomarNumero(form.deducaoPercentual)
      };
    }
    if (form.retencaoCp || form.retencaoIrrf || form.retencaoCsll) {
      body.infDPS.valores.trib.tribFed = {
        vRetCP: tomarNumero(form.retencaoCp),
        vRetIRRF: tomarNumero(form.retencaoIrrf),
        vRetCSLL: tomarNumero(form.retencaoCsll)
      };
    }
    if (form.valorBaseCalculo) body.infDPS.valores.trib.tribMun.vBC = +form.valorBaseCalculo;
    if (form.valorIss) body.infDPS.valores.trib.tribMun.vISSQN = +form.valorIss;
    if (form.valorLiquido) body.infDPS.valores.trib.tribMun.vLiq = +form.valorLiquido;
    if (cpfCnpjInterm) {
      body.infDPS.interm = {
        CNPJ: ehCnpj(cpfCnpjInterm) ? cpfCnpjInterm : undefined,
        CPF: !ehCnpj(cpfCnpjInterm) ? cpfCnpjInterm : undefined,
        xNome: tomarNumero(form.intermNome)
      };
    }

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
    return [{ label: 'Emitir NFS-e', icon: 'an-plus', action: () => this.abrirEmissao() }];
  }

  acoesSecundarias(): PoPageAction[] {
    return [{ label: 'Nova Nota', icon: 'an-file-plus', action: () => this.incluirNota() }];
  }
}
