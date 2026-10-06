export type ImportType = 'clients' | 'services' | 'inventory'

export interface ImportField {
  key: string
  label: string
  required?: boolean
  hint?: string
  aliases: string[]
}

export interface ImportTypeDef {
  type: ImportType
  label: string
  description: string
  fields: ImportField[]
}

export const MAX_IMPORT_ROWS = 2000
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024

/** Clé de comparaison insensible aux accents, à la casse et à la ponctuation. */
export function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const clientFields: ImportField[] = [
  {
    key: 'firstName',
    label: 'Nome próprio',
    required: true,
    hint: 'Se a coluna contiver o nome completo, o apelido é separado automaticamente',
    aliases: ['nome', 'nome proprio', 'primeiro nome', 'nome completo', 'cliente', 'nome do cliente', 'first name', 'prenom'],
  },
  {
    key: 'lastName',
    label: 'Apelido',
    aliases: ['apelido', 'sobrenome', 'ultimo nome', 'last name', 'surname', 'nom'],
  },
  { key: 'email', label: 'Email', aliases: ['email', 'e mail', 'mail', 'correio', 'correio eletronico'] },
  {
    key: 'phone',
    label: 'Telefone',
    aliases: ['telefone', 'telemovel', 'tel', 'tlf', 'phone', 'contacto', 'numero', 'nr telefone', 'movel'],
  },
  { key: 'address', label: 'Morada', aliases: ['morada', 'endereco', 'address', 'rua', 'localidade'] },
  { key: 'nif', label: 'NIF', aliases: ['nif', 'contribuinte', 'numero de contribuinte', 'vat'] },
  { key: 'notes', label: 'Notas do cliente', aliases: ['notas', 'observacoes', 'obs', 'comentarios', 'notes'] },
  {
    key: 'animalName',
    label: 'Nome do animal',
    hint: 'Deixe em branco se o ficheiro só tiver clientes',
    aliases: ['animal', 'nome do animal', 'nome animal', 'pet', 'cao', 'gato', 'animal name'],
  },
  {
    key: 'animalSpecies',
    label: 'Espécie',
    hint: 'Reconhece cão/gato/coelho/pássaro em várias grafias',
    aliases: ['especie', 'species', 'tipo', 'tipo de animal', 'tipo animal'],
  },
  { key: 'animalBreed', label: 'Raça', aliases: ['raca', 'breed', 'raca do animal'] },
  { key: 'animalColor', label: 'Cor', aliases: ['cor', 'color', 'pelagem'] },
  {
    key: 'animalBirth',
    label: 'Data de nascimento do animal',
    aliases: ['data de nascimento', 'nascimento', 'data nascimento', 'aniversario', 'birth', 'date of birth', 'dob'],
  },
  { key: 'animalAllergies', label: 'Alergias', aliases: ['alergias', 'allergies', 'alergia'] },
  {
    key: 'animalNotes',
    label: 'Notas do animal',
    aliases: ['notas do animal', 'observacoes do animal', 'notas animal', 'comportamento'],
  },
]

const serviceFields: ImportField[] = [
  {
    key: 'name',
    label: 'Nome do serviço',
    required: true,
    aliases: ['nome', 'servico', 'service', 'designacao', 'prestacao', 'nome do servico'],
  },
  {
    key: 'price',
    label: 'Preço (€)',
    hint: 'Obrigatório, exceto nos serviços marcados como flexíveis',
    aliases: ['preco', 'price', 'valor', 'tarifa', 'custo', 'preco base'],
  },
  {
    key: 'duration',
    label: 'Duração (min)',
    hint: 'Se vazio, fica 60 min',
    aliases: ['duracao', 'tempo', 'minutos', 'duration', 'min', 'duracao em minutos'],
  },
  { key: 'description', label: 'Descrição', aliases: ['descricao', 'description', 'detalhe', 'detalhes'] },
  {
    key: 'isFlexible',
    label: 'Flexível',
    hint: 'sim / não, x, 1 / 0, true / false',
    aliases: ['flexivel', 'flexible', 'variavel', 'preco variavel'],
  },
  { key: 'minPrice', label: 'Preço mín. (€)', aliases: ['preco minimo', 'preco min', 'min price', 'minimo'] },
  { key: 'maxPrice', label: 'Preço máx. (€)', aliases: ['preco maximo', 'preco max', 'max price', 'maximo'] },
  { key: 'minDuration', label: 'Duração mín. (min)', aliases: ['duracao minima', 'duracao min', 'min duration', 'tempo minimo'] },
  { key: 'maxDuration', label: 'Duração máx. (min)', aliases: ['duracao maxima', 'duracao max', 'max duration', 'tempo maximo'] },
]

const inventoryFields: ImportField[] = [
  {
    key: 'name',
    label: 'Nome do artigo',
    required: true,
    aliases: ['nome', 'produto', 'artigo', 'item', 'designacao', 'nome do produto'],
  },
  { key: 'quantity', label: 'Quantidade', hint: 'Se vazio, fica 0', aliases: ['quantidade', 'qtd', 'qtde', 'stock', 'existencia', 'qty'] },
  { key: 'price', label: 'Preço (€)', hint: 'Se vazio, fica 0', aliases: ['preco', 'price', 'valor', 'custo', 'pvp', 'preco unitario'] },
  {
    key: 'unit',
    label: 'Unidade',
    hint: 'Se vazio, fica "un"',
    aliases: ['unidade', 'un', 'medida', 'unit', 'unidade de medida'],
  },
  { key: 'description', label: 'Descrição', aliases: ['descricao', 'description', 'detalhe', 'notas'] },
  {
    key: 'category',
    label: 'Categoria',
    hint: 'Categorias inexistentes são criadas automaticamente',
    aliases: ['categoria', 'familia', 'grupo', 'tipo', 'category'],
  },
]

export const importTypes: Record<ImportType, ImportTypeDef> = {
  clients: {
    type: 'clients',
    label: 'Clientes e animais',
    description:
      'Uma linha por animal. O mesmo cliente repetido em várias linhas é criado uma única vez, com todos os seus animais.',
    fields: clientFields,
  },
  services: {
    type: 'services',
    label: 'Serviços',
    description: 'Uma linha por serviço, com o preço e a duração praticados no salão.',
    fields: serviceFields,
  },
  inventory: {
    type: 'inventory',
    label: 'Inventário',
    description: 'Uma linha por artigo em stock.',
    fields: inventoryFields,
  },
}

export function isImportType(value: unknown): value is ImportType {
  return value === 'clients' || value === 'services' || value === 'inventory'
}

/**
 * Associe chaque champ cible à l'index de colonne du fichier dont l'en-tête correspond.
 * Correspondance exacte (normalisée) d'abord, puis préfixe/inclusion pour les en-têtes verbeux.
 */
export function autoMapColumns(headers: string[], fields: ImportField[]): Record<string, number> {
  const normalized = headers.map(normalizeHeader)
  const used = new Set<number>()
  const mapping: Record<string, number> = {}

  const claim = (key: string, index: number) => {
    mapping[key] = index
    used.add(index)
  }

  for (const field of fields) {
    const aliases = [field.label, ...field.aliases].map(normalizeHeader)
    const exact = normalized.findIndex((header, index) => !used.has(index) && header.length > 0 && aliases.includes(header))
    if (exact !== -1) claim(field.key, exact)
  }

  for (const field of fields) {
    if (mapping[field.key] !== undefined) continue
    const aliases = [field.label, ...field.aliases].map(normalizeHeader).filter(alias => alias.length >= 3)
    const partial = normalized.findIndex(
      (header, index) =>
        !used.has(index) && header.length > 0 && aliases.some(alias => header.startsWith(alias) || header.includes(alias))
    )
    if (partial !== -1) claim(field.key, partial)
  }

  return mapping
}
