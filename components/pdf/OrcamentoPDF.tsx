import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { Orcamento, Empresa, OrcamentoItem } from '@/types'

// ─── Estilos ────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e8500a',
  },
  logo: {
    width: 100,
    height: 40,
    objectFit: 'contain',
  },
  empresaNome: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
  },
  empresaInfo: {
    fontSize: 8,
    color: '#666677',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  orcamentoNumero: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#e8500a',
  },
  orcamentoTitulo: {
    fontSize: 10,
    color: '#444455',
    marginTop: 2,
    maxWidth: 180,
    textAlign: 'right',
  },

  // Bloco cliente / info
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e8500a',
  },
  infoBoxTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#e8500a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoLine: {
    fontSize: 9,
    color: '#333344',
    marginBottom: 2,
  },
  infoLineLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#555566',
  },

  // Tabela
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
    backgroundColor: '#F0F0FA',
    padding: 6,
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 3,
  },
  groupTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#e8500a',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e8500a',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E8F5',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCDD',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  colDesc: { flex: 1 },
  colUnit: { width: 40, textAlign: 'center' },
  colQty: { width: 50, textAlign: 'right' },
  colPrice: { width: 70, textAlign: 'right' },
  colTotal: { width: 75, textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#444455',
  },
  tdText: {
    fontSize: 8,
    color: '#333344',
  },
  tdTotal: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
  },
  groupSubtotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff5f0',
    borderTopWidth: 1,
    borderTopColor: '#e8500a',
  },
  groupSubtotalText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#c94208',
  },

  // Resumo financeiro
  resumo: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resumoBox: {
    width: 220,
    borderWidth: 1,
    borderColor: '#E0E0EE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resumoLabel: {
    fontSize: 9,
    color: '#666677',
  },
  resumoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
  },
  resumoTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e8500a',
  },
  resumoTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
  },
  resumoTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0A0A0F',
  },

  // Observações
  obsSection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#F8F8FF',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#CCCCDD',
  },
  obsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#555566',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  obsText: {
    fontSize: 8,
    color: '#666677',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#AAAAAA',
  },
})

// ─── Helpers ────────────────────────────────────────────────
function fmtCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtNum(v: number) {
  return v % 1 === 0 ? String(v) : v.toFixed(2).replace('.', ',')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─── Componente ─────────────────────────────────────────────
interface Props {
  orcamento: Orcamento
  empresa: Empresa | null
}

export function OrcamentoPDF({ orcamento, empresa }: Props) {
  const secaoVendas = orcamento.secoes?.find(s => s.tipo === 'vendas')
  const hoje = new Date().toLocaleDateString('pt-BR')
  const validade = orcamento.data_validade
    ? fmtDate(orcamento.data_validade)
    : `${orcamento.validade_dias} dias`

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── HEADER ─────────────────────── */}
        <View style={S.header}>
          <View>
            {empresa?.logo_url ? (
              <Image src={empresa.logo_url} style={S.logo} />
            ) : (
              <Text style={S.empresaNome}>{empresa?.nome ?? 'Empresa'}</Text>
            )}
            {empresa?.nome && empresa?.logo_url && (
              <Text style={S.empresaNome}>{empresa.nome}</Text>
            )}
            {empresa?.cnpj && <Text style={S.empresaInfo}>CNPJ: {empresa.cnpj}</Text>}
            {empresa?.telefone && <Text style={S.empresaInfo}>{empresa.telefone}</Text>}
            {empresa?.email && <Text style={S.empresaInfo}>{empresa.email}</Text>}
            {empresa?.endereco && <Text style={S.empresaInfo}>{empresa.endereco}</Text>}
          </View>

          <View style={S.headerRight}>
            <Text style={S.orcamentoNumero}>#{orcamento.numero}</Text>
            <Text style={S.orcamentoTitulo}>{orcamento.titulo}</Text>
            <Text style={{ ...S.empresaInfo, marginTop: 6 }}>Emissão: {hoje}</Text>
            <Text style={S.empresaInfo}>Validade: {validade}</Text>
          </View>
        </View>

        {/* ── CLIENTE + DADOS ────────────── */}
        <View style={S.infoRow}>
          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>Cliente</Text>
            <Text style={S.infoLine}>{orcamento.cliente_nome ?? '—'}</Text>
            {orcamento.cliente_email && (
              <Text style={S.infoLine}>{orcamento.cliente_email}</Text>
            )}
            {orcamento.cliente_telefone && (
              <Text style={S.infoLine}>{orcamento.cliente_telefone}</Text>
            )}
            {orcamento.cliente_cpf_cnpj && (
              <Text style={S.infoLine}>
                <Text style={S.infoLineLabel}>CPF/CNPJ: </Text>
                {orcamento.cliente_cpf_cnpj}
              </Text>
            )}
            {orcamento.cliente_endereco && (
              <Text style={S.infoLine}>{orcamento.cliente_endereco}</Text>
            )}
          </View>

          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>Condições</Text>
            {orcamento.condicoes_pagamento ? (
              <Text style={S.infoLine}>{orcamento.condicoes_pagamento}</Text>
            ) : empresa?.texto_condicoes_pagamento ? (
              <Text style={S.infoLine}>{empresa.texto_condicoes_pagamento}</Text>
            ) : (
              <Text style={S.infoLine}>—</Text>
            )}
          </View>
        </View>

        {/* ── INTRODUÇÃO ─────────────────── */}
        {(orcamento.texto_introducao ?? empresa?.texto_introducao) && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 9, color: '#444455', lineHeight: 1.5 }}>
              {orcamento.texto_introducao ?? empresa?.texto_introducao}
            </Text>
          </View>
        )}

        {/* ── SERVIÇOS (seção vendas) ─────── */}
        <Text style={S.sectionTitle}>ORÇAMENTO DE SERVIÇOS</Text>

        {/* Cabeçalho da tabela */}
        <View style={S.tableHeader}>
          <Text style={{ ...S.thText, ...S.colDesc }}>Descrição</Text>
          <Text style={{ ...S.thText, ...S.colUnit }}>Unid.</Text>
          <Text style={{ ...S.thText, ...S.colQty }}>Qtd.</Text>
          <Text style={{ ...S.thText, ...S.colPrice }}>Preço Unit.</Text>
          <Text style={{ ...S.thText, ...S.colTotal }}>Total</Text>
        </View>

        {secaoVendas?.grupos?.map((grupo) => (
          <View key={grupo.id}>
            <Text style={S.groupTitle}>{grupo.nome}</Text>
            {grupo.itens?.map((item: OrcamentoItem, idx: number) => (
              <View key={item.id} style={[S.tableRow, ...(idx % 2 === 1 ? [S.tableRowAlt] : [])]}>
                <Text style={{ ...S.tdText, ...S.colDesc }}>{item.descricao}</Text>
                <Text style={{ ...S.tdText, ...S.colUnit }}>{item.unidade ?? 'un'}</Text>
                <Text style={{ ...S.tdText, ...S.colQty }}>{fmtNum(item.quantidade)}</Text>
                <Text style={{ ...S.tdText, ...S.colPrice }}>{fmtCurrency(item.preco_unitario_venda)}</Text>
                <Text style={{ ...S.tdTotal, ...S.colTotal }}>{fmtCurrency(item.total_venda)}</Text>
              </View>
            ))}
            <View style={S.groupSubtotal}>
              <Text style={S.groupSubtotalText}>Subtotal: {fmtCurrency(grupo.subtotal)}</Text>
            </View>
          </View>
        ))}

        {(!secaoVendas?.grupos || secaoVendas.grupos.length === 0) && (
          <View style={S.tableRow}>
            <Text style={{ ...S.tdText, flex: 1, textAlign: 'center', color: '#999' }}>
              Nenhum item encontrado
            </Text>
          </View>
        )}

        {/* ── RESUMO FINANCEIRO ──────────── */}
        <View style={S.resumo}>
          <View style={S.resumoBox}>
            {orcamento.desconto_valor > 0 && (
              <>
                <View style={S.resumoRow}>
                  <Text style={S.resumoLabel}>Subtotal</Text>
                  <Text style={S.resumoValue}>{fmtCurrency(orcamento.total_venda)}</Text>
                </View>
                <View style={S.resumoRow}>
                  <Text style={S.resumoLabel}>
                    Desconto ({orcamento.desconto_percentual.toFixed(1)}%)
                  </Text>
                  <Text style={{ ...S.resumoValue, color: '#16A34A' }}>
                    -{fmtCurrency(orcamento.desconto_valor)}
                  </Text>
                </View>
              </>
            )}
            <View style={S.resumoTotalRow}>
              <Text style={S.resumoTotalLabel}>TOTAL GERAL</Text>
              <Text style={S.resumoTotalValue}>{fmtCurrency(orcamento.total_final || orcamento.total_venda)}</Text>
            </View>
          </View>
        </View>

        {/* ── OBSERVAÇÕES ────────────────── */}
        {(orcamento.observacoes ?? empresa?.texto_observacoes) && (
          <View style={S.obsSection}>
            <Text style={S.obsTitle}>Observações</Text>
            <Text style={S.obsText}>
              {orcamento.observacoes ?? empresa?.texto_observacoes}
            </Text>
          </View>
        )}

        {/* ── FOOTER ─────────────────────── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            {empresa?.nome} — Orçamento #{orcamento.numero}
          </Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  )
}
