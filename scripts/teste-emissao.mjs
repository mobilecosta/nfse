#!/usr/bin/env node
/**
 * Script de testes para emissão de NFS-e da empresa 66.549.275/0001-97
 * via ACBr API (ambiente de homologação).
 *
 * Uso:
 *   node scripts/teste-emissao.mjs                 # emite 3 NFS-e de exemplo
 *   node scripts/teste-emissao.mjs --qtd 5         # quantidade de notas
 *   node scripts/teste-emissao.mjs --cidade 3550308
 *   node scripts/teste-emissao.mjs --listar        # apenas lista notas existentes
 *   node scripts/teste-emissao.mjs --cancelar <id> # cancela uma nota
 *
 * Variáveis de ambiente (opcional):
 *   ACBR_CLIENT_ID, ACBR_CLIENT_SECRET, ACBR_AMBIENTE (homologacao|producao)
 */

const CNPJ_EMPRESA = '66549275000197';

const CLIENT_ID = process.env.ACBR_CLIENT_ID || '1l7JPNYuvVqpJUtGW1Zi';
const CLIENT_SECRET = process.env.ACBR_CLIENT_SECRET || 'bINzBI5iyXU3kYu0BdhWY2wrDEkJQUCJ';
const AMBIENTE = process.env.ACBR_AMBIENTE || 'homologacao';
const API_URL = AMBIENTE === 'producao' ? 'https://prod.acbr.api.br' : 'https://hom.acbr.api.br';
const AUTH_URL = 'https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token';

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const QTD_NOTAS = parseInt(flag('qtd', '3'), 10);
const CIDADE_IBGE = flag('cidade', null);
const PROVEDOR = 'padrao';

let token = null;

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} - ${path}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function obterToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'empresa nfse'
  });
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao obter token: HTTP ${res.status} - ${text}`);
  }
  const data = await res.json();
  token = data.access_token;
  console.log(`[OK] Token obtido (expira em ${Math.round(data.expires_in / 86400)} dias)`);
}

async function consultarEmpresa() {
  try {
    const emp = await api(`/empresas/${CNPJ_EMPRESA}`);
    console.log(`[OK] Empresa: ${emp.nome_razao_social} (${emp.cpf_cnpj})`);
    return emp;
  } catch (e) {
    if (e.status === 404) {
      console.log(`[AVISO] Empresa ${CNPJ_EMPRESA} não cadastrada. Cadastre antes de emitir.`);
      return null;
    }
    throw e;
  }
}

async function consultarCertificado() {
  try {
    const cert = await api(`/empresas/${CNPJ_EMPRESA}/certificado`);
    console.log(`[OK] Certificado: ${cert.subject_name} (válido até ${cert.not_valid_after})`);
    return cert;
  } catch (e) {
    if (e.status === 404) {
      console.log('[AVISO] Nenhum certificado cadastrado para a empresa.');
      return null;
    }
    throw e;
  }
}

async function consultarConfigNfse() {
  try {
    const cfg = await api(`/empresas/${CNPJ_EMPRESA}/nfse`);
    console.log(`[OK] Config NFS-e: ambiente=${cfg.ambiente}, rps.serie=${cfg.rps?.serie}, rps.lote=${cfg.rps?.lote}, rps.numero=${cfg.rps?.numero}`);
    return cfg;
  } catch (e) {
    if (e.status === 404) {
      console.log('[AVISO] Configuração NFS-e não definida para a empresa.');
      return null;
    }
    throw e;
  }
}

async function consultarMetadadosCidade(codigoIbge) {
  try {
    const meta = await api(`/nfse/cidades/${codigoIbge}`);
    console.log(`[OK] Cidade ${meta.codigo_ibge} - ${meta.municipio}/${meta.uf} | provedor: ${meta.provedor} | ambientes: ${meta.ambientes.join(', ')}`);
    return meta;
  } catch (e) {
    console.log(`[AVISO] Não foi possível consultar metadados da cidade ${codigoIbge}: ${e.message}`);
    return null;
  }
}

function montarDps(index, cidadeIbge) {
  const agora = new Date();
  const dhEmi = agora.toISOString().slice(0, 19);
  const valorServico = 100 + index * 50;
  const aliquota = 5;
  const issqn = +(valorServico * aliquota / 100).toFixed(2);

  return {
    provedor: PROVEDOR,
    ambiente: AMBIENTE,
    referencia: `TESTE-${agora.getTime()}-${index}`,
    infDPS: {
      dhEmi,
      prest: { CNPJ: CNPJ_EMPRESA },
      toma: {
        CNPJ: '11222333000181',
        xNome: `Tomador Teste ${index}`,
        email: 'tomador.teste@exemplo.com.br',
        fone: '1133334444',
        end: {
          endNac: { cMun: cidadeIbge, CEP: '09400000' },
          xLgr: 'Avenida Paulista',
          nro: '1000',
          xCpl: 'CJ 101',
          xBairro: 'Bela Vista'
        }
      },
      serv: {
        locPrest: { cLocPrestacao: cidadeIbge },
        cServ: {
          cTribNac: '6202300',
          cTribMun: '01001',
          CNAE: '6201500',
          xDescServ: 'Desenvolvimento de software sob encomenda - teste automatizado'
        }
      },
      valores: {
        vServPrest: { vServ: valorServico },
        trib: {
          tribMun: { tribISSQN: 1, pAliq: aliquota, vISSQN: issqn, cLocIncid: cidadeIbge }
        }
      }
    }
  };
}

async function emitirNota(index, cidadeIbge) {
  const body = montarDps(index, cidadeIbge);
  const nota = await api('/nfse/dps', { method: 'POST', body: JSON.stringify(body) });
  console.log(`[OK] NFS-e ${index + 1}: id=${nota.id} | status=${nota.status} | numero=${nota.numero || '-'} | ref=${body.referencia}`);
  return nota;
}

async function listarNotas() {
  const lista = await api(`/nfse?cpf_cnpj=${CNPJ_EMPRESA}&ambiente=${AMBIENTE}&$top=100`);
  const notas = lista.data || [];
  console.log(`[OK] Total de NFS-e no ambiente ${AMBIENTE}: ${notas.length}`);
  for (const n of notas) {
    console.log(`     - ${n.id} | ${n.status} | numero=${n.numero || '-'} | ${n.data_emissao || n.created_at || ''}`);
  }
  return notas;
}

async function cancelarNota(id, motivo = 'Teste automatizado - cancelamento') {
  const res = await api(`/nfse/${id}/cancelamento`, {
    method: 'POST',
    body: JSON.stringify({ codigo: '1', motivo })
  });
  console.log(`[OK] Cancelamento solicitado: ${JSON.stringify(res)}`);
  return res;
}

async function main() {
  console.log(`=== Teste NFS-e | ACBr API | ${AMBIENTE} | CNPJ ${CNPJ_EMPRESA} ===`);
  await obterToken();
  const empresa = await consultarEmpresa();
  await consultarCertificado();
  await consultarConfigNfse();

  let cidade = CIDADE_IBGE;
  if (!cidade) {
    if (empresa?.endereco?.codigo_municipio) {
      cidade = empresa.endereco.codigo_municipio;
      console.log(`[INFO] Usando cidade da empresa: ${cidade} (${empresa.endereco.cidade})`);
    } else {
      cidade = '3543303';
      console.log('[INFO] Empresa sem município cadastrado; usando 3543303 (Ribeirão Pires).');
    }
  }
  await consultarMetadadosCidade(cidade);

  if (args.includes('--listar')) {
    await listarNotas();
    return;
  }

  const cancelarIdx = args.indexOf('--cancelar');
  if (cancelarIdx >= 0) {
    await cancelarNota(args[cancelarIdx + 1], flag('motivo', 'Teste automatizado - cancelamento'));
    return;
  }

  console.log(`\nEmitindo ${QTD_NOTAS} NFS-e em ${AMBIENTE}...`);
  const emitidas = [];
  for (let i = 0; i < QTD_NOTAS; i++) {
    try {
      emitidas.push(await emitirNota(i, cidade));
    } catch (e) {
      console.log(`[ERRO] Nota ${i + 1}: ${e.message}${e.body ? ' - ' + JSON.stringify(e.body) : ''}`);
    }
  }

  console.log('\n=== Resumo final ===');
  await listarNotas();
  const autorizadas = emitidas.filter(n => n.status === 'autorizada').length;
  console.log(`\nEmitidas com sucesso: ${autorizadas}/${emitidas.length}`);
}

main().catch(e => {
  console.error(`[ERRO FATAL] ${e.message}`);
  process.exit(1);
});
