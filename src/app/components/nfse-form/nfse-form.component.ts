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
    this.nfseForm.enable();
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
    this.nfseForm.enable();
    if (!this.nfseForm.get('prestadorCpfCnpj')?.value) {
      this.nfseForm.patchValue({ prestadorCpfCnpj: '66549275000197' });
    }
    this.modalEmissao?.open();
  }

  visualizarNota(nota: any) {
    this.notaSelecionada = nota;
    this.modoVisualizacao = true;
    this.nfseForm.disable();
    this.carregando.set(true);
    this.nfseService.baixarXmlDps(nota.id).subscribe({
      next: (xml: string) => {
        this.carregando.set(false);
        this.preencherFormularioDoXml(xml);
        this.modalEmissao?.open();
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.poNotification.error('Erro ao carregar nota: ' + (error.error?.message || error.statusText));
      }
    });
  }

  private preencherFormularioDoXml(xmlBruto: string) {
    let xml = xmlBruto;
    if (xml.trim().startsWith('"')) {
      try { xml = JSON.parse(xml); } catch { /* mantém texto original */ }
    }
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) {
      this.poNotification.error('Não foi possível interpretar o XML da nota.');
      return;
    }
    const t = (root: Document | Element | undefined, tag: string) => {
      const el = root?.getElementsByTagNameNS('*', tag)[0];
      return el?.textContent?.trim() ?? '';
    };
    const ufPorCodigo: Record<string, string> = {
      '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
      '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
      '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR', '42': 'SC', '43': 'RS',
      '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    };
    const ufPorCodigoMunicipio = (codigo: string) => ufPorCodigo[codigo?.substring(0, 2) || ''] || '';

    const ehNacional = !!doc.getElementsByTagNameNS('*', 'infDPS')[0];

    if (ehNacional) {
      const inf = doc.getElementsByTagNameNS('*', 'infDPS')[0];
      const prest = inf.getElementsByTagNameNS('*', 'prest')[0];
      const toma = inf.getElementsByTagNameNS('*', 'toma')[0];
      const interm = inf.getElementsByTagNameNS('*', 'interm')[0];
      const serv = inf.getElementsByTagNameNS('*', 'serv')[0];
      const cServ = serv ? serv.getElementsByTagNameNS('*', 'cServ')[0] : undefined;
      const valores = inf.getElementsByTagNameNS('*', 'valores')[0];
      const vServPrest = valores ? valores.getElementsByTagNameNS('*', 'vServPrest')[0] : undefined;
      const trib = valores ? valores.getElementsByTagNameNS('*', 'trib')[0] : undefined;
      const tribMun = trib ? trib.getElementsByTagNameNS('*', 'tribMun')[0] : undefined;
      const tribFed = trib ? trib.getElementsByTagNameNS('*', 'tribFed')[0] : undefined;
      const vDesc = valores ? valores.getElementsByTagNameNS('*', 'vDescCondIncond')[0] : undefined;
      const vDedRed = valores ? valores.getElementsByTagNameNS('*', 'vDedRed')[0] : undefined;
      const end = toma ? toma.getElementsByTagNameNS('*', 'end')[0] : undefined;
      const endNac = end ? end.getElementsByTagNameNS('*', 'endNac')[0] : undefined;
      const locPrest = serv ? serv.getElementsByTagNameNS('*', 'locPrest')[0] : undefined;

      const cnpjPrest = t(prest, 'CNPJ') || t(prest, 'CPF') || '';
      const cnpjTom = t(toma, 'CNPJ') || t(toma, 'CPF') || t(toma, 'NIF') || '';
      const cnpjInterm = t(interm, 'CNPJ') || t(interm, 'CPF') || t(interm, 'NIF') || '';
      const vServ = parseFloat(t(vServPrest ?? doc, 'vServ')) || 0;
      const pAliq = parseFloat(t(tribMun ?? doc, 'pAliq')) || 0;
      const cMun = t(endNac ?? doc, 'cMun') || '';

      this.nfseForm.patchValue({
        prestadorCpfCnpj: cnpjPrest || '66549275000197',
        prestadorInscricaoMunicipal: t(prest, 'IM'),
        prestadorEmail: t(prest, 'email'),
        prestadorTelefone: t(prest, 'fone'),
        tomadorCpfCnpj: cnpjTom,
        tomadorNome: t(toma, 'xNome'),
        tomadorLogradouro: t(end, 'xLgr'),
        tomadorNumero: t(end, 'nro'),
        tomadorComplemento: t(end, 'xCpl'),
        tomadorBairro: t(end, 'xBairro'),
        tomadorCidade: cMun,
        tomadorCodigoMunicipio: cMun,
        tomadorUf: ufPorCodigoMunicipio(cMun),
        tomadorCep: t(endNac, 'CEP'),
        tomadorEmail: t(toma, 'email'),
        tomadorTelefone: t(toma, 'fone'),
        tomadorInscricaoMunicipal: t(toma, 'IM'),
        tomadorInscricaoEstadual: t(toma, 'IE'),
        tomadorNif: t(toma, 'NIF'),
        tomadorCaepf: t(toma, 'CAEPF'),
        intermCpfCnpj: cnpjInterm,
        intermNome: t(interm, 'xNome'),
        servicoCodigoCnae: t(cServ, 'CNAE'),
        servicoCodigoTributacao: t(cServ, 'cTribNac'),
        servicoCodigoTributacaoMunicipal: t(cServ, 'cTribMun'),
        servicoNbs: t(cServ, 'cNBS'),
        servicoNaturezaOperacao: t(cServ, 'cNatOp'),
        servicoSituacaoTributaria: t(cServ, 'cSitTrib'),
        servicoDescricao: t(cServ, 'xDescServ'),
        servicoQuantidade: 1,
        servicoValorUnitario: vServ,
        servicoAliquotaIss: parseFloat(pAliq.toFixed(2)),
        tributacaoIssqn: parseInt(t(tribMun ?? doc, 'tribISSQN'), 10) || 1,
        retencaoIssqn: parseInt(t(tribMun ?? doc, 'tpRetISSQN'), 10) || 1,
        localIncidencia: t(locPrest ?? doc, 'cLocPrestacao') || t(tribMun ?? doc, 'cLocIncid') || cMun,
        valorDescontoIncondicionado: parseFloat(t(vDesc ?? doc, 'vDescIncond')) || 0,
        valorDescontoCondicionado: parseFloat(t(vDesc ?? doc, 'vDescCond')) || 0,
        deducaoValor: parseFloat(t(vDedRed ?? doc, 'vDR')) || 0,
        deducaoPercentual: parseFloat(t(vDedRed ?? doc, 'pDR')) || 0,
        retencaoCp: parseFloat(t(tribFed ?? doc, 'vRetCP')) || 0,
        retencaoIrrf: parseFloat(t(tribFed ?? doc, 'vRetIRRF')) || 0,
        retencaoCsll: parseFloat(t(tribFed ?? doc, 'vRetCSLL')) || 0,
        valorBaseCalculo: parseFloat(t(tribMun ?? doc, 'vBC')) || vServ,
        valorIss: parseFloat(t(tribMun ?? doc, 'vISSQN')) || 0,
        valorLiquido: parseFloat(t(tribMun ?? doc, 'vLiq')) || parseFloat((vServ - (parseFloat(t(tribMun ?? doc, 'vISSQN')) || 0)).toFixed(2))
      });
      return;
    }

    const inf = doc.getElementsByTagNameNS('*', 'InfDeclaracaoPrestacaoServico')[0];
    const prestador = inf ? inf.getElementsByTagNameNS('*', 'Prestador')[0] : undefined;
    const tomador = inf ? inf.getElementsByTagNameNS('*', 'TomadorServico')[0] : undefined;
    const servico = inf ? inf.getElementsByTagNameNS('*', 'Servico')[0] : undefined;
    const valores = servico ? servico.getElementsByTagNameNS('*', 'Valores')[0] : undefined;
    const endTom = tomador ? tomador.getElementsByTagNameNS('*', 'Endereco')[0] : undefined;

    const cnpjPrest = prestador ? (t(prestador, 'Cnpj') || t(prestador, 'Cpf')) : '';
    const cnpjTom = tomador ? (t(tomador, 'Cnpj') || t(tomador, 'Cpf')) : '';
    const valorServicos = parseFloat(t(valores ?? doc, 'ValorServicos')) || 0;
    const valorIss = parseFloat(t(valores ?? doc, 'ValorIss')) || 0;
    const aliquota = parseFloat(t(valores ?? doc, 'Aliquota')) || 0;
    const baseCalculo = parseFloat(t(valores ?? doc, 'BaseCalculo')) || 0;
    const exigibilidade = t(servico ?? doc, 'ExigibilidadeISS') || '1';
    const issRetido = t(servico ?? doc, 'IssRetido') || '2';
    const exigibilidadeMap: Record<string, number> = { '1': 1, '2': 4, '3': 2, '4': 3, '5': 2 };
    const issRetidoMap: Record<string, number> = { '1': 2, '2': 1 };

    this.nfseForm.patchValue({
      prestadorCpfCnpj: cnpjPrest || '66549275000197',
      prestadorNome: prestador ? t(prestador, 'RazaoSocial') || t(prestador, 'NomeFantasia') : '',
      prestadorInscricaoMunicipal: prestador ? t(prestador, 'InscricaoMunicipal') : '',
      prestadorEmail: prestador ? t(prestador, 'Email') : '',
      prestadorTelefone: prestador ? t(prestador, 'Fone') : '',
      tomadorCpfCnpj: cnpjTom,
      tomadorNome: tomador ? t(tomador, 'RazaoSocial') : '',
      tomadorLogradouro: endTom ? t(endTom, 'Endereco') : '',
      tomadorNumero: endTom ? t(endTom, 'Numero') : '',
      tomadorComplemento: endTom ? t(endTom, 'Complemento') : '',
      tomadorBairro: endTom ? t(endTom, 'Bairro') : '',
      tomadorCidade: endTom ? t(endTom, 'CodigoMunicipio') : '',
      tomadorCodigoMunicipio: endTom ? t(endTom, 'CodigoMunicipio') : '',
      tomadorUf: endTom ? t(endTom, 'Uf') : '',
      tomadorCep: endTom ? t(endTom, 'Cep') : '',
      tomadorEmail: tomador ? t(tomador, 'Email') : '',
      tomadorTelefone: tomador ? t(tomador, 'Fone') : '',
      servicoCodigoCnae: servico ? t(servico, 'CodigoCnae') : '',
      servicoCodigoTributacao: servico ? t(servico, 'ItemListaServico') : '',
      servicoCodigoTributacaoMunicipal: servico ? t(servico, 'CodigoTributacaoMunicipio') : '',
      servicoDescricao: servico ? t(servico, 'Discriminacao') : '',
      servicoQuantidade: 1,
      servicoValorUnitario: valorServicos,
      servicoAliquotaIss: parseFloat((aliquota * 100).toFixed(2)),
      tributacaoIssqn: exigibilidadeMap[exigibilidade] ?? 1,
      retencaoIssqn: issRetidoMap[issRetido] ?? 1,
      localIncidencia: servico ? t(servico, 'MunicipioIncidencia') || t(servico, 'CodigoMunicipio') : '',
      valorBaseCalculo: baseCalculo || valorServicos,
      valorIss,
      valorLiquido: parseFloat((valorServicos - valorIss).toFixed(2))
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
