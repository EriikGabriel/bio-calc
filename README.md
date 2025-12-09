# Bio-Calc - Análise de Ciclo de Vida de Biocombustíveis

Sistema para cálculo e análise do ciclo de vida de biocombustíveis, aplicando a metodologia Circular Footprint Formula (CFF) e calculando créditos de carbono (CBIOs).

## 🚀 Run project on local

```bash
npm install
```

```bash
npm run dev
```

## 📄 Exportação de Resultados em PDF

O sistema inclui funcionalidade de exportação dos resultados da análise em formato PDF profissional.

### Características da Exportação

- **Botão flutuante**: Disponível na aba de resultados quando há dados calculados
- **PDF personalizado**: Inclui cabeçalho com logo e informações da empresa
- **Paginação automática**: Divide o conteúdo em múltiplas páginas quando necessário
- **Rodapé informativo**: Numeração de páginas e identificação do sistema
- **Alta qualidade**: Renderização em escala 2x para melhor legibilidade
- **Nome automático**: Arquivo gerado com data no formato `relatorio-ciclo-vida-biocombustivel-YYYY-MM-DD.pdf`

### Como Usar

1. Preencha todas as etapas do formulário (Informações da Empresa, Fase Agrícola, Fase Industrial, Fase de Distribuição)
2. Clique em "Calcular" para gerar os resultados
3. Na aba "Resultados", clique no botão "Exportar Resultados em PDF" no canto superior direito
4. Aguarde a geração (indicada pelo spinner de carregamento)
5. O PDF será automaticamente baixado para sua pasta de downloads

### Conteúdo do PDF

O PDF exportado inclui todos os componentes visíveis na aba de resultados:

- ✅ Métricas principais (Intensidade de Carbono, Redução vs Diesel, Impacto Total)
- ✅ Cards detalhados por fase (Agrícola, Industrial, Distribuição)
- ✅ Classificação Energético-Ambiental (Nota A+ a E)
- ✅ Gráficos de contribuição das etapas
- ✅ Gráfico de redução de emissões comparativa
- ✅ Score de sustentabilidade
- ✅ Análise de distribuição do impacto
- ✅ Resumo comparativo de reduções
- ✅ Detalhamento da fase agrícola
- ✅ Detalhamento da fase industrial
- ✅ Comparação com combustíveis fósseis
- ✅ Tabela de resultados detalhados
- ✅ Classificação energético-ambiental expandida
- ✅ Análise de créditos de carbono (CBIOs)
- ✅ Insights e oportunidades de melhoria
- ✅ Tabela final com aplicação da CFF

### Componentes Técnicos

**Bibliotecas utilizadas:**

- `jspdf`: Geração de documentos PDF
- `html2canvas`: Captura de elementos HTML como imagem

**Componentes criados:**

- `ExportPDFButton`: Botão de exportação com loading state
- `ResultsWithExport`: Wrapper que integra resultados com botão de exportação

**Localização dos arquivos:**

- `/src/components/export-pdf-button.tsx`
- `/src/components/results-with-export.tsx`

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

````js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

  ## API

  Foi adicionada a rota `POST /api/calculate` para calcular cada fase. Esta rota aceita um corpo JSON com até três seções: `agricultural`, `industrial` e `distribution`. Você pode enviar apenas as seções que deseja calcular.

  ### Exemplo de requisição

  ```json
  {
    "agricultural": {
      "biomassInputSpecific": "1,2",
      "biomassImpactFactor": "0.05",
      "cornStarchInput": "0.1",
      "mutAllocationPercent": "25",
      "transportDistanceKm": "100"
    },
    "industrial": {
      "processedBiomassKgPerYear": "100000",
      "gridMixMediumVoltage": "50000",
      "fuelDieselLitersPerYear": "12000"
    },
    "distribution": {
      "domesticBiomassQuantityTon": "3000",
      "domesticTransportDistanceKm": "250",
      "domesticRoadPercent": "100"
    }
  }
````

### Exemplo de resposta

```json
{
  "ok": true,
  "result": {
    "agricultural": {
      "biomassImpactPerMJ": 0.06,
      "cornStarchImpactPerMJ": 0.0012,
      "mutImpactPerMJ": 0.006,
      "transportDemandTkm": 2000,
      "transportImpactPerMJ": 0.0096,
      "totalImpactPerMJ": 0.0768,
      "assumptions": { "calorificMJPerKg": 16.5 }
    },
    "industrial": {
      "electricityImpactYear": 3000,
      "fuelImpactYear": 32160,
      "manufacturingImpactYear": 0,
      "totalImpactYear": 35160,
      "impactPerMJ": 0.0213
    },
    "distribution": {
      "domesticImpactYear": 60000,
      "exportImpactFactoryToPortYear": 0,
      "exportImpactPortToMarketYear": 0,
      "totalImpactYear": 60000
    }
  }
}
```

Observação: os cálculos atuais usam fatores e fórmulas de placeholder. Eles devem ser substituídos pelos fatores e relações da planilha BioCalc assim que estiver disponível para integração. A estrutura da API já está pronta para receber os fatores corretos.

### Como testar localmente

Você pode usar uma chamada HTTP (por exemplo, com `curl` ou uma ferramenta como Insomnia) para fazer um POST para `http://localhost:3000/api/calculate` com o JSON acima.

### Contrato de entrada/saída (resumo)

- Entrada: `{ agricultural?: object, industrial?: object, distribution?: object }` com campos numéricos aceitando vírgula como separador decimal.
- Saída: métricas por fase:
  - `agricultural`: impactos por MJ (`biomassImpactPerMJ`, `cornStarchImpactPerMJ`, `mutImpactPerMJ`, `transportImpactPerMJ`, `totalImpactPerMJ`) e `transportDemandTkm`.
  - `industrial`: impactos anuais (`electricityImpactYear`, `fuelImpactYear`, `manufacturingImpactYear`, `totalImpactYear`) e `impactPerMJ`.
  - `distribution`: impactos anuais doméstico e exportação e `totalImpactYear`.

## 📊 Aba de Resultados - Explicação dos Cálculos

A aba de resultados apresenta uma análise completa do ciclo de vida do biocombustível, aplicando a **Circular Footprint Formula (CFF)** e calculando métricas ambientais e econômicas. Abaixo está a explicação detalhada de cada componente.

### 1. Métricas Principais

#### Intensidade de Carbono

```
Intensidade de Carbono (kg CO₂eq/MJ) = Total de emissões de CO₂ / Energia produzida
```

Representa a quantidade de CO₂ equivalente emitida para produzir 1 MJ de energia do biocombustível, considerando todo o ciclo de vida (agrícola + industrial + distribuição).

#### Redução vs Diesel

```
Redução (%) = ((Intensidade Diesel - Intensidade Biocombustível) / Intensidade Diesel) × 100
```

- **Diesel A**: 0.0867 kg CO₂eq/MJ (benchmark)
- Mostra o percentual de redução de emissões em relação ao combustível fóssil

#### Impacto Total Anual

```
Impacto Total Anual = Impacto Industrial Anual + Impacto Distribuição Anual
```

Soma das emissões anuais das fases industrial e de distribuição em kg CO₂eq/ano.

### 2. Contribuição das Etapas do Ciclo de Vida

#### Fase Agrícola

```
Total Agrícola = Biomassa + Amido + MUT + Transporte
```

- **Biomassa**: Impacto da produção da matéria-prima
- **Amido de Milho**: Impacto dos insumos complementares
- **MUT (Mudança de Uso da Terra)**: Alocação percentual configurável
- **Transporte**: Impacto do transporte da biomassa

#### Fase Industrial

```
Total Industrial = Eletricidade + Combustível + Manufatura
```

- **Eletricidade**: Consumo energético da planta industrial
- **Combustível**: Diesel/combustível usado no processamento
- **Manufatura**: Impacto da infraestrutura e equipamentos

#### Fase de Distribuição

```
Total Distribuição = Doméstico + Exportação (Fábrica→Porto) + Exportação (Porto→Mercado)
```

### 3. Gráficos Disponíveis

#### Gráfico de Pizza - Contribuição das Etapas

Mostra a proporção de cada fase no impacto total:

```
Contribuição (%) = (Impacto da Fase / Impacto Total) × 100
```

**Cores utilizadas:**

- 🟢 Agrícola: `#5e8c61` (forest-600)
- 🔵 Industrial: `#72bda3` (sage-500)
- 🟡 Distribuição: `#b0c5af` (herb-300)

#### Gráfico de Redução de Emissões

Compara a redução percentual do biocombustível em relação a três combustíveis fósseis:

```
Redução vs Diesel A = ((0.0867 - Intensidade Bio) / 0.0867) × 100
Redução vs Óleo Pesado = ((0.094 - Intensidade Bio) / 0.094) × 100
Redução vs Coque = ((0.120 - Intensidade Bio) / 0.120) × 100
```

#### Gráfico de Barras Empilhadas

Visualiza a composição do impacto total, empilhando as contribuições das três fases.

#### Score de Sustentabilidade (Circular)

```
Score (%) = min(100, Redução vs Diesel)
```

Limitado a 100% para representação visual, mas o valor real pode ultrapassar.

### 4. Classificação Energético-Ambiental

Sistema de notas baseado na redução de emissões:

| Nota | Redução de Emissões | Cor          |
| ---- | ------------------- | ------------ |
| A+   | ≥ 400%              | Verde Escuro |
| A    | 350-399%            | Verde        |
| B    | 300-349%            | Verde Claro  |
| C    | 250-299%            | Amarelo      |
| D    | 200-249%            | Laranja      |
| E    | < 200%              | Vermelho     |

### 5. Créditos de Carbono (CBIOs)

#### Elegibilidade

```
Elegível se: Redução ≥ 50% (requisito mínimo do RenovaBio)
```

#### Cálculo de CBIOs

```
CBIOs = (Nota de Eficiência / 100) × Produção Anual (ton) × Fator de Conversão
```

**Fatores de Conversão:**

- Diesel A / Óleo Pesado: `0.456`
- Coque de Petróleo: `0.457`

#### Receita Potencial

```
Receita Anual = CBIOs Estimados × Valor Unitário (R$ 80/CBIO)
```

**Exemplo de cálculo** (produção de 10.000 ton/ano com 400% de redução):

```
CBIOs Diesel = (400 / 100) × 10.000 × 0.456 = 18.240 CBIOs
Receita = 18.240 × R$ 80 = R$ 1.459.200/ano
```

### 6. Tabela Final - Circular Footprint Formula (CFF)

#### Intensidade de Carbono do Biocombustível

Valor calculado aplicando a metodologia CFF, que considera:

- Emissões diretas e indiretas do ciclo de vida
- Alocação de coprodutos
- Créditos por circularidade (quando aplicável)

#### Comparação com Combustíveis Fósseis Equivalentes

**Valores de referência:**

- **Diesel A, Gasolina A e GNV** (Média ponderada): `0.087 kg CO₂eq/MJ`
- **Óleo combustível pesado**: `0.094 kg CO₂eq/MJ`
- **Coque de Petróleo**: `0.120 kg CO₂eq/MJ`

#### Nota de Eficiência Energético-Ambiental

```
Nota = ((Intensidade Fóssil - Intensidade Bio) / Intensidade Fóssil) × 100
```

Esta nota representa quantas vezes o biocombustível é mais eficiente que o fóssil. Valores acima de 100% indicam que o biocombustível emite muito menos que o fóssil.

#### Redução de Emissões

```
Redução (%) = Nota de Eficiência × 100
```

Expressa a redução percentual em formato expandido (ex: 28.006,81% significa redução de 280 vezes).

### 7. Resumo Executivo Final

#### Média de Redução

```
Média = (Redução Diesel + Redução Óleo + Redução Coque) / 3
```

#### CBIOs Médios Estimados

```
CBIOs Médios = (CBIOs Diesel + CBIOs Óleo + CBIOs Coque) / 3
```

#### Receita Potencial Média

```
Receita = CBIOs Médios × R$ 80
```

### 8. Insights e Oportunidades

O sistema analisa automaticamente os resultados e fornece insights baseados em thresholds:

#### Pontos Fortes (identificados quando):

- Redução > 300% → "Excelente desempenho ambiental"
- Fase Agrícola < 30% do total → "Fase agrícola otimizada"
- Fase Industrial < 50% do total → "Processo industrial eficiente"
- Elegível para CBIOs

#### Oportunidades de Melhoria (identificadas quando):

- Fase Agrícola > 50% do total → "Otimizar práticas agrícolas"
- Fase Industrial > 50% do total → "Investir em eficiência energética"
- Fase Distribuição > 20% do total → "Otimizar logística"
- Sempre sugerido: "Considerar certificação ISO 14064"

### 9. Considerações Importantes

1. **Fatores de Emissão**: Os cálculos utilizam fatores de emissão baseados em dados do IPCC e inventários nacionais.

2. **Produção de Referência**: Os cálculos de CBIOs consideram uma usina de médio porte com produção anual de 10.000 toneladas.

3. **Valor do CBIO**: O valor de R$ 80/CBIO é uma estimativa. O valor real varia conforme o mercado.

4. **Certificação Oficial**: Para certificação oficial de CBIOs e participação no programa RenovaBio, é necessário seguir os procedimentos da ANP (Agência Nacional do Petróleo, Gás Natural e Biocombustíveis).

5. **Atualização de Dados**: Os valores de referência dos combustíveis fósseis devem ser periodicamente atualizados conforme as diretrizes nacionais e internacionais.

### 10. Referências Metodológicas

- **CFF (Circular Footprint Formula)**: Metodologia da Comissão Europeia para avaliação de ciclo de vida de produtos circulares
- **RenovaBio**: Programa brasileiro de incentivo aos biocombustíveis (Lei 13.576/2017)
- **IPCC Guidelines**: Diretrizes do Painel Intergovernamental sobre Mudanças Climáticas
- **ISO 14064**: Norma internacional para quantificação e reporte de emissões de GEE

        // Remove tseslint.configs.recommended and replace with this
        tseslint.configs.recommendedTypeChecked,
        // Alternatively, use this for stricter rules
        tseslint.configs.strictTypeChecked,
        // Optionally, add this for stylistic rules
        tseslint.configs.stylisticTypeChecked,

        // Other configs...
      ],
      languageOptions: {
        parserOptions: {
          project: ['./tsconfig.node.json', './tsconfig.app.json'],
          tsconfigRootDir: import.meta.dirname,
        },
        // other options...
      },

  },
  ])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
