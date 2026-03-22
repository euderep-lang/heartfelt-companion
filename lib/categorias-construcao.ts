export const CATEGORIAS_CONSTRUCAO = [
  { nome: 'Fundação',          icone: '⛏️',  cor: '#92400E', keywords: ['fundação', 'fundacao', 'sapata', 'estaca', 'bloco', 'radier', 'tubulao', 'tubulão', 'contenção', 'contencao'] },
  { nome: 'Estrutura',         icone: '🏗️',  cor: '#1E3A5F', keywords: ['estrutura', 'pilar', 'viga', 'laje', 'concreto', 'armação', 'armacao', 'ferragem', 'forma', 'fôrma', 'colunas'] },
  { nome: 'Alvenaria',         icone: '🧱',  cor: '#7C3AED', keywords: ['alvenaria', 'tijolo', 'bloco', 'parede', 'vedação', 'vedacao', 'argamassa', 'assentamento'] },
  { nome: 'Cobertura',         icone: '🏠',  cor: '#B45309', keywords: ['telhado', 'telha', 'cobertura', 'calha', 'rufo', 'cumeeira', 'madeiramento', 'metalica', 'metálica', 'fibrocimento'] },
  { nome: 'Revestimento',      icone: '✨',  cor: '#0D9488', keywords: ['revestimento', 'azulejo', 'porcelanato', 'ceramica', 'cerâmica', 'piso', 'assentamento', 'rejunte', 'granito', 'marmore', 'mármore', 'ladrilho'] },
  { nome: 'Acabamento',        icone: '🎨',  cor: '#0284C7', keywords: ['acabamento', 'pintura', 'textura', 'gesso', 'massa', 'sanca', 'moldura', 'rodape', 'rodapé', 'soleira', 'verniz', 'tinta', 'esmalte'] },
  { nome: 'Gesso e Drywall',   icone: '🔲',  cor: '#6366F1', keywords: ['gesso', 'drywall', 'dry wall', 'placa', 'perfilado', 'forro', 'divisoria', 'divisória', 'tabica', 'acartonado', 'drywalleiro'] },
  { nome: 'Hidráulica',        icone: '💧',  cor: '#0891B2', keywords: ['hidraulica', 'hidráulica', 'encanamento', 'tubulação', 'tubulacao', 'cano', 'registro', 'valvula', 'válvula', 'banheiro', 'torneira', 'chuveiro', 'vaso', 'pia', 'esgoto', 'agua', 'água', 'caixa dagua', 'caixa d'] },
  { nome: 'Elétrica',          icone: '⚡',  cor: '#D97706', keywords: ['eletrica', 'elétrica', 'fiacao', 'fiação', 'tomada', 'interruptor', 'disjuntor', 'quadro', 'eletroduto', 'cabo', 'fio', 'iluminacao', 'iluminação', 'lampada', 'lâmpada', 'luminaria', 'luminária'] },
  { nome: 'Esquadrias',        icone: '🚪',  cor: '#475569', keywords: ['esquadria', 'porta', 'janela', 'portao', 'portão', 'vidro', 'vidracaria', 'vidraçaria', 'box', 'aluminio', 'alumínio', 'fechadura', 'dobradica', 'dobradiça', 'correr', 'basculante'] },
  { nome: 'Impermeabilização', icone: '🛡️',  cor: '#7C3AED', keywords: ['impermeabilizacao', 'impermeabilização', 'manta', 'membrana', 'vedacao', 'vedação', 'selante', 'drenagem', 'flexivel', 'flexível', 'calafete', 'silicon'] },
  { nome: 'Demolição',         icone: '🔨',  cor: '#DC2626', keywords: ['demolicao', 'demolição', 'quebra', 'remocao', 'remoção', 'entulho', 'escavação', 'escavacao', 'terraplanagem', 'corte', 'martelete'] },
  { nome: 'Mão de Obra',       icone: '👷',  cor: '#0F766E', keywords: ['mao de obra', 'mão de obra', 'pedreiro', 'servente', 'eletricista', 'encanador', 'pintor', 'gesseiro', 'oficial', 'ajudante', 'operario', 'operário', 'mestre', 'empreitada', 'diaria', 'diária'] },
  { nome: 'Materiais Gerais',  icone: '📦',  cor: '#64748B', keywords: ['material', 'insumo', 'cimento', 'areia', 'brita', 'aco', 'aço', 'madeira', 'prego', 'parafuso', 'cola', 'selador', 'cal', 'grama', 'saco'] },
  { nome: 'Limpeza',           icone: '🧹',  cor: '#0D9488', keywords: ['limpeza', 'lavagem', 'higienizacao', 'higienização', 'remocao de entulho', 'faxina', 'vassoura', 'esponja'] },
  { nome: 'Paisagismo',        icone: '🌿',  cor: '#16A34A', keywords: ['paisagismo', 'jardim', 'grama', 'planta', 'irrigacao', 'irrigação', 'muro verde', 'jardinagem', 'gramado', 'árvore', 'arvore'] },
  { nome: 'Outros',            icone: '📋',  cor: '#94A3B8', keywords: [] },
]

export type CategoriaConstucao = typeof CATEGORIAS_CONSTRUCAO[number]

export function encontrarCategoriaPorKeyword(nome: string, descricao?: string): string | null {
  const texto = `${nome} ${descricao ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  for (const cat of CATEGORIAS_CONSTRUCAO) {
    if (cat.nome === 'Outros') continue
    const match = cat.keywords.some(kw =>
      texto.includes(kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    if (match) return cat.nome
  }
  return null
}
