# Run project on local

```bash
npm install
```

```bash
npm run dev
```

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
- Saída: métricas por fase: - `agricultural`: impactos por MJ (`biomassImpactPerMJ`, `cornStarchImpactPerMJ`, `mutImpactPerMJ`, `transportImpactPerMJ`, `totalImpactPerMJ`) e `transportDemandTkm`. - `industrial`: impactos anuais (`electricityImpactYear`, `fuelImpactYear`, `manufacturingImpactYear`, `totalImpactYear`) e `impactPerMJ`. - `distribution`: impactos anuais doméstico e exportação e `totalImpactYear`.

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
