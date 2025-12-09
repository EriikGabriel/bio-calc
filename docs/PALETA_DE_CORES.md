# Paleta de Cores do Projeto Bio-Calc

Este documento descreve a paleta de cores utilizada no projeto e suas aplicações nos gráficos e componentes.

## Cores Principais

### Verde Floresta (Forest)

- **forest-600**: `#5e8c61`
- **Uso**: Cor principal do projeto, fase agrícola, biocombustíveis
- **Aplicações**:
  - Gráfico de pizza: Fase Agrícola
  - Gráfico de barras agrícola: Biomassa
  - Gráfico de comparação: Biocombustível (destaque)
  - Gráfico industrial: Combustível

### Verde Sálvia (Sage)

- **sage-500**: `#72bda3`
- **Uso**: Cor secundária, fase industrial
- **Aplicações**:
  - Gráfico de pizza: Fase Industrial
  - Gráfico de barras agrícola: MUT
  - Gráfico industrial: Eletricidade

### Verde Erva (Herb)

- **herb-300**: `#b0c5af`
- **Uso**: Cor terciária, distribuição
- **Aplicações**:
  - Gráfico de pizza: Fase de Distribuição
  - Gráfico de barras agrícola: Transporte

### Verde Menta (Mint)

- **mint-300**: `#94e8b4`
- **Uso**: Cor de destaque claro
- **Aplicações**:
  - Gráfico de barras agrícola: Amido

### Verde Cedro (Cedar)

- **cedar-700**: `#4e6151`
- **Uso**: Cor escura para manufatura e combustíveis fósseis
- **Aplicações**:
  - Gráfico industrial: Manufatura
  - Gráfico de comparação: Óleo Pesado

### Marrom Terra (Soil)

- **soil-800**: `#3b322c`
- **Uso**: Cor para combustíveis fósseis e contraste
- **Aplicações**:
  - Gráfico de comparação: Diesel A e Coque de Petróleo

## Uso nos Gráficos

### Gráfico de Pizza - Contribuição das Etapas

- **Agrícola**: `#5e8c61` (forest-600)
- **Industrial**: `#72bda3` (sage-500)
- **Distribuição**: `#b0c5af` (herb-300)

### Gráfico de Barras - Detalhamento Agrícola

- **Biomassa**: `#5e8c61` (forest-600)
- **Amido**: `#94e8b4` (mint-300)
- **MUT**: `#72bda3` (sage-500)
- **Transporte**: `#b0c5af` (herb-300)

### Gráfico de Barras - Detalhamento Industrial

- **Eletricidade**: `#72bda3` (sage-500)
- **Combustível**: `#5e8c61` (forest-600)
- **Manufatura**: `#4e6151` (cedar-700)

### Gráfico de Comparação - Combustíveis Fósseis vs Biocombustível

- **Diesel A**: `#3b322c` (soil-800)
- **Óleo Pesado**: `#4e6151` (cedar-700)
- **Coque de Petróleo**: `#3b322c` (soil-800)
- **Biocombustível**: `#5e8c61` (forest-600) - destaque verde

## Diretrizes de Uso

1. **Cores verdes** devem ser usadas para representar elementos sustentáveis e biocombustíveis
2. **Cores escuras (soil/cedar)** devem ser usadas para representar combustíveis fósseis e criar contraste
3. A cor **forest-600** é a principal e deve ser usada para os elementos mais importantes
4. Variar tonalidades de verde ajuda a diferenciar categorias relacionadas mantendo harmonia visual
5. Manter consistência: mesma fase/categoria deve usar a mesma cor em diferentes gráficos

## Acessibilidade

- As cores escolhidas oferecem contraste adequado para leitura
- A diferenciação por tonalidade ajuda usuários com diferentes tipos de daltonismo
- Sempre usar labels e tooltips além das cores para garantir compreensão
