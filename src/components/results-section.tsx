"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CalculateResponse } from "@/types/api"
import { formatNumber } from "@/utils/format"
import { Award, Factory, Leaf, TrendingDown, Truck } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

type ResultsSectionProps = {
  result: CalculateResponse | null
  companyName?: string
  biomassType?: string
}

export function ResultsSection({
  result,
  companyName,
  biomassType,
}: ResultsSectionProps) {
  if (!result || !result.ok) {
    return (
      <div className="p-8 text-center text-soil-600">
        <p className="text-lg">Nenhum resultado disponível ainda.</p>
        <p className="text-sm mt-2">
          Complete todas as etapas e clique em "Calcular" para ver os
          resultados.
        </p>
      </div>
    )
  }

  const { computed, sheet } = result

  // Paleta de cores do projeto:
  // #5e8c61 - forest-600 (verde floresta principal)
  // #72bda3 - sage-500 (verde sálvia)
  // #b0c5af - herb-300 (verde erva claro)
  // #94e8b4 - mint-300 (verde menta)
  // #4e6151 - cedar-700 (verde cedro escuro)
  // #3b322c - soil-800 (marrom terra)

  // Dados para o gráfico de pizza - Contribuição das etapas
  const agricultureValue = computed?.agricultural?.totalImpactPerMJ ?? 0
  const industrialValue = computed?.industrial?.impactPerMJ ?? 0
  const distributionValue = computed?.distribution?.totalImpactYear ?? 0

  const totalContribution =
    agricultureValue + industrialValue + distributionValue / 1000

  const pieData = [
    {
      phase: "Agrícola",
      value: agricultureValue,
      fill: "#5e8c61", // forest-600
    },
    {
      phase: "Industrial",
      value: industrialValue,
      fill: "#72bda3", // sage-500
    },
    {
      phase: "Distribuição",
      value: distributionValue / 1000,
      fill: "#b0c5af", // herb-300
    },
  ]

  const pieConfig: ChartConfig = {
    value: {
      label: "Impacto (kg CO₂eq/MJ)",
    },
    agricola: {
      label: "Agrícola",
      color: "#5e8c61",
    },
    industrial: {
      label: "Industrial",
      color: "#72bda3",
    },
    distribuicao: {
      label: "Distribuição",
      color: "#b0c5af",
    },
  }

  // Dados para gráfico de barras - Detalhamento da fase agrícola
  const agricultureDetailData = computed?.agricultural
    ? [
        {
          category: "Biomassa",
          value: computed.agricultural.biomassImpactPerMJ,
          fill: "#5e8c61", // forest-600
        },
        {
          category: "Amido",
          value: computed.agricultural.cornStarchImpactPerMJ,
          fill: "#94e8b4", // mint-300
        },
        {
          category: "MUT",
          value: computed.agricultural.mutImpactPerMJ,
          fill: "#72bda3", // sage-500
        },
        {
          category: "Transporte",
          value: computed.agricultural.transportImpactPerMJ,
          fill: "#b0c5af", // herb-300
        },
      ]
    : []

  const barConfig: ChartConfig = {
    value: {
      label: "Impacto (kg CO₂eq/MJ)",
    },
  }

  // Dados para gráfico de área - Fase industrial detalhada
  const industrialDetailData = computed?.industrial
    ? [
        {
          category: "Eletricidade",
          value: computed.industrial.electricityImpactYear,
          fill: "#72bda3", // sage-500
        },
        {
          category: "Combustível",
          value: computed.industrial.fuelImpactYear,
          fill: "#5e8c61", // forest-600
        },
        {
          category: "Manufatura",
          value: computed.industrial.manufacturingImpactYear,
          fill: "#4e6151", // cedar-700
        },
      ]
    : []

  const areaConfig: ChartConfig = {
    value: {
      label: "Impacto (kg CO₂eq/ano)",
    },
  }

  // Intensidade de carbono
  const carbonIntensity =
    sheet && typeof sheet === "object" && "intensity" in sheet
      ? Number(sheet.intensity)
      : totalContribution

  // Comparação com combustíveis fósseis (valores de exemplo)
  const fossilComparison = [
    {
      fuel: "Diesel A",
      value: 0.0867,
      fill: "#3b322c", // soil-800 (combustíveis fósseis)
    },
    {
      fuel: "Óleo Pesado",
      value: 0.094,
      fill: "#4e6151", // cedar-700 (combustíveis fósseis)
    },
    {
      fuel: "Coque de Petróleo",
      value: 0.12,
      fill: "#3b322c", // soil-800 (combustíveis fósseis)
    },
    {
      fuel: biomassType || "Biocombustível",
      value: carbonIntensity,
      fill: "#5e8c61", // forest-600 (biocombustível - destaque verde)
    },
  ]

  const comparisonConfig: ChartConfig = {
    value: {
      label: "Intensidade (kg CO₂eq/MJ)",
    },
  }

  // Cálculo de redução de emissões
  const dieselIntensity = 0.0867
  const oleoIntensity = 0.094
  const coqueIntensity = 0.12

  const reductionPercent =
    ((dieselIntensity - carbonIntensity) / dieselIntensity) * 100
  const reductionOleo =
    ((oleoIntensity - carbonIntensity) / oleoIntensity) * 100
  const reductionCoque =
    ((coqueIntensity - carbonIntensity) / coqueIntensity) * 100

  // Dados para gráfico de redução de emissões
  const reductionData = [
    {
      fuel: "vs Diesel A",
      reduction: Math.abs(reductionPercent),
      fill: "#5e8c61",
    },
    {
      fuel: "vs Óleo Pesado",
      reduction: Math.abs(reductionOleo),
      fill: "#72bda3",
    },
    {
      fuel: "vs Coque",
      reduction: Math.abs(reductionCoque),
      fill: "#94e8b4",
    },
  ]

  const reductionConfig: ChartConfig = {
    reduction: {
      label: "Redução (%)",
    },
  }

  // Dados para gráfico de barras empilhadas - Comparação de fases
  const stackedData = [
    {
      phase: "Total",
      agricola: agricultureValue,
      industrial: industrialValue,
      distribuicao: distributionValue / 1000,
    },
  ]

  const stackedConfig: ChartConfig = {
    agricola: {
      label: "Agrícola",
      color: "#5e8c61",
    },
    industrial: {
      label: "Industrial",
      color: "#72bda3",
    },
    distribuicao: {
      label: "Distribuição",
      color: "#b0c5af",
    },
  }

  // Dados para gráfico radial - Score de sustentabilidade
  const sustainabilityScore = Math.max(0, Math.min(100, reductionPercent))
  // ...existing code...

  // ...existing code...

  // Dados para gráfico de linha - Distribuição de impacto por categoria
  const lineData = [
    {
      category: "Agrícola",
      valor: agricultureValue,
      percentual: (agricultureValue / totalContribution) * 100,
    },
    {
      category: "Industrial",
      valor: industrialValue,
      percentual: (industrialValue / totalContribution) * 100,
    },
    {
      category: "Distribuição",
      valor: distributionValue / 1000,
      percentual: (distributionValue / 1000 / totalContribution) * 100,
    },
  ]

  // ...existing code...

  // Cálculo de nota de eficiência energético-ambiental
  const energyEfficiencyScore = Math.abs(reductionPercent)
  let efficiencyGrade = "E"
  let efficiencyColor = "text-red-700"
  let efficiencyBgColor = "bg-red-50"
  let efficiencyBorderColor = "border-red-600"

  if (energyEfficiencyScore >= 400) {
    efficiencyGrade = "A+"
    efficiencyColor = "text-green-800"
    efficiencyBgColor = "bg-green-50"
    efficiencyBorderColor = "border-green-600"
  } else if (energyEfficiencyScore >= 350) {
    efficiencyGrade = "A"
    efficiencyColor = "text-green-700"
    efficiencyBgColor = "bg-green-50"
    efficiencyBorderColor = "border-green-600"
  } else if (energyEfficiencyScore >= 300) {
    efficiencyGrade = "B"
    efficiencyColor = "text-lime-700"
    efficiencyBgColor = "bg-lime-50"
    efficiencyBorderColor = "border-lime-600"
  } else if (energyEfficiencyScore >= 250) {
    efficiencyGrade = "C"
    efficiencyColor = "text-yellow-700"
    efficiencyBgColor = "bg-yellow-50"
    efficiencyBorderColor = "border-yellow-600"
  } else if (energyEfficiencyScore >= 200) {
    efficiencyGrade = "D"
    efficiencyColor = "text-orange-700"
    efficiencyBgColor = "bg-orange-50"
    efficiencyBorderColor = "border-orange-600"
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com botão de exportação */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-forest-700">
            Resultados da Análise
          </h2>
          {companyName && (
            <p className="text-soil-600 mt-1">
              Empresa: <span className="font-semibold">{companyName}</span>
            </p>
          )}
          {biomassType && (
            <p className="text-soil-600">
              Biomassa: <span className="font-semibold">{biomassType}</span>
            </p>
          )}
        </div>

        {/* Botão de exportação será adicionado externamente */}
        <div id="export-pdf-button-container"></div>
      </div>

      {/* Container principal com ID para exportação */}
      <div id="results-content-export" className="space-y-6">
        {/* Métricas principais */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-cedar-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700">
                Intensidade de Carbono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-700">
                {formatNumber(carbonIntensity, 4)}
              </div>
              <p className="text-xs text-soil-600 mt-1">kg CO₂eq/MJ</p>
            </CardContent>
          </Card>

          <Card className="border-cedar-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700">
                Redução vs Diesel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {formatNumber(Math.abs(reductionPercent), 2)}%
              </div>
              <p className="text-xs text-soil-600 mt-1">Menor emissão de CO₂</p>
            </CardContent>
          </Card>

          <Card className="border-cedar-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700">
                Impacto Total Anual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-700">
                {formatNumber(
                  (computed?.industrial?.totalImpactYear ?? 0) +
                    (computed?.distribution?.totalImpactYear ?? 0),
                  2
                )}
              </div>
              <p className="text-xs text-soil-600 mt-1">kg CO₂eq/ano</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards adicionais de métricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-sage-500 bg-linear-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-forest-600" />
                Fase Agrícola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-forest-700">
                {formatNumber(agricultureValue, 4)}
              </div>
              <p className="text-xs text-soil-600 mt-1">
                {formatNumber((agricultureValue / totalContribution) * 100, 1)}%
                do total
              </p>
            </CardContent>
          </Card>

          <Card className="border-sage-500 bg-linear-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-sage-500" />
                Fase Industrial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-sage-600">
                {formatNumber(industrialValue, 4)}
              </div>
              <p className="text-xs text-soil-600 mt-1">
                {formatNumber((industrialValue / totalContribution) * 100, 1)}%
                do total
              </p>
            </CardContent>
          </Card>

          <Card className="border-herb-300 bg-linear-to-br from-teal-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soil-700 flex items-center gap-2">
                <Truck className="h-4 w-4 text-herb-300" />
                Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-teal-700">
                {formatNumber(distributionValue / 1000, 4)}
              </div>
              <p className="text-xs text-soil-600 mt-1">
                {formatNumber(
                  (distributionValue / 1000 / totalContribution) * 100,
                  1
                )}
                % do total
              </p>
            </CardContent>
          </Card>

          <Card
            className={`${efficiencyBorderColor} ${efficiencyBgColor} border-2`}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`text-sm font-medium ${efficiencyColor} flex items-center gap-2`}
              >
                <Award className="h-4 w-4" />
                Nota Ambiental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${efficiencyColor}`}>
                {efficiencyGrade}
              </div>
              <p className={`text-xs ${efficiencyColor} mt-1`}>
                {formatNumber(energyEfficiencyScore, 0)}% de redução
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Pizza - Contribuição das etapas */}
        <Card className="border-cedar-700">
          <CardHeader>
            <CardTitle className="text-forest-700">
              Contribuição das Etapas do Ciclo de Vida
            </CardTitle>
            <CardDescription>
              Distribuição do impacto de carbono por fase do processo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={pieConfig}
              className="mx-auto aspect-square max-h-[400px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="phase"
                  innerRadius={80}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-forest-700 text-3xl font-bold"
                            >
                              {formatNumber(totalContribution, 4)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-soil-600 text-sm"
                            >
                              kg CO₂eq/MJ
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Novo: Gráfico de Redução de Emissões */}
        <Card className="border-green-600">
          <CardHeader>
            <CardTitle className="text-forest-700 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Redução de Emissões Comparativa
            </CardTitle>
            <CardDescription>
              Percentual de redução em relação aos combustíveis fósseis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={reductionConfig} className="h-[300px]">
              <BarChart data={reductionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="fuel"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="reduction" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Novo: Gráfico de Barras Empilhadas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-cedar-700">
            <CardHeader>
              <CardTitle className="text-forest-700">
                Composição do Impacto Total
              </CardTitle>
              <CardDescription>
                Contribuição acumulada das fases do ciclo de vida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={stackedConfig} className="h-[300px]">
                <BarChart data={stackedData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value, 3)}
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="phase"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={60}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="agricola"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                    fill="#5e8c61"
                  />
                  <Bar
                    dataKey="industrial"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                    fill="#72bda3"
                  />
                  <Bar
                    dataKey="distribuicao"
                    stackId="a"
                    radius={[0, 8, 8, 0]}
                    fill="#b0c5af"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Novo: Card de Score de Sustentabilidade */}
          <Card className="border-green-600 bg-linear-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-forest-700">
                Score de Sustentabilidade
              </CardTitle>
              <CardDescription>
                Índice de eficiência energético-ambiental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[280px]">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#5e8c61"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${
                        (Math.min(100, sustainabilityScore) / 100) * 502.4
                      } 502.4`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-forest-700">
                      {formatNumber(Math.min(100, sustainabilityScore), 0)}%
                    </div>
                    <div className="text-sm text-soil-600 mt-1">Eficiência</div>
                  </div>
                </div>
                <p className="text-sm text-center text-soil-700 mt-4 max-w-xs">
                  Score baseado na redução de emissões comparado ao Diesel A
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Barras - Detalhamento Agrícola */}
          {computed?.agricultural && (
            <Card className="border-cedar-700">
              <CardHeader>
                <CardTitle className="text-forest-700">
                  Detalhamento da Fase Agrícola
                </CardTitle>
                <CardDescription>
                  Impacto por componente da fase agrícola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barConfig} className="h-[300px]">
                  <BarChart data={agricultureDetailData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value, 4)}
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Área - Detalhamento Industrial */}
          {computed?.industrial && (
            <Card className="border-cedar-700">
              <CardHeader>
                <CardTitle className="text-forest-700">
                  Detalhamento da Fase Industrial
                </CardTitle>
                <CardDescription>
                  Impacto anual por categoria industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={areaConfig} className="h-[300px]">
                  <BarChart data={industrialDetailData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value, 0)}
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráfico de Comparação com Combustíveis Fósseis */}
        <Card className="border-cedar-700">
          <CardHeader>
            <CardTitle className="text-forest-700">
              Comparação com Combustíveis Fósseis
            </CardTitle>
            <CardDescription>
              Intensidade de carbono: biocombustível vs combustíveis fósseis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={comparisonConfig} className="h-[300px]">
              <BarChart data={fossilComparison} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value, 3)}
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="fuel"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={120}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Novo: Tabela de Análise de Distribuição */}
        <Card className="border-cedar-700">
          <CardHeader>
            <CardTitle className="text-forest-700">
              Análise de Distribuição do Impacto
            </CardTitle>
            <CardDescription>
              Valor absoluto e percentual de contribuição por fase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-linear-to-r from-white to-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            index === 0
                              ? "#5e8c61"
                              : index === 1
                              ? "#72bda3"
                              : "#b0c5af",
                        }}
                      />
                      <span className="font-semibold text-forest-700">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-forest-700">
                      {formatNumber(item.percentual, 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soil-600">Impacto:</span>
                    <span className="font-semibold text-soil-800">
                      {formatNumber(item.valor, 4)} kg CO₂eq/MJ
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentual}%`,
                        backgroundColor:
                          index === 0
                            ? "#5e8c61"
                            : index === 1
                            ? "#72bda3"
                            : "#b0c5af",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Novo: Card de Resumo Comparativo */}
        <Card className="border-green-600 bg-linear-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-forest-700">
              Resumo Comparativo de Reduções
            </CardTitle>
            <CardDescription>
              Comparação detalhada com diferentes combustíveis fósseis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm text-soil-600 mb-1">vs Diesel A</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(Math.abs(reductionPercent), 1)}%
                  </div>
                  <div className="text-xs text-soil-600 mt-1">
                    {formatNumber(dieselIntensity - carbonIntensity, 4)} kg
                    CO₂eq/MJ
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm text-soil-600 mb-1">
                    vs Óleo Pesado
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(Math.abs(reductionOleo), 1)}%
                  </div>
                  <div className="text-xs text-soil-600 mt-1">
                    {formatNumber(oleoIntensity - carbonIntensity, 4)} kg
                    CO₂eq/MJ
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm text-soil-600 mb-1">
                    vs Coque de Petróleo
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(Math.abs(reductionCoque), 1)}%
                  </div>
                  <div className="text-xs text-soil-600 mt-1">
                    {formatNumber(coqueIntensity - carbonIntensity, 4)} kg
                    CO₂eq/MJ
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-2">
                  <TrendingDown className="h-4 w-4" />
                  Média de Redução
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {formatNumber(
                    (Math.abs(reductionPercent) +
                      Math.abs(reductionOleo) +
                      Math.abs(reductionCoque)) /
                      3,
                    1
                  )}
                  %
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Em relação aos três principais combustíveis fósseis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Resultados Detalhados */}
        <Card className="border-cedar-700">
          <CardHeader>
            <CardTitle className="text-forest-700">
              Resultados Detalhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {computed?.agricultural && (
                <div>
                  <h4 className="font-semibold text-forest-700 mb-2">
                    Fase Agrícola
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-soil-600">Impacto da Biomassa:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.agricultural.biomassImpactPerMJ,
                        6
                      )}{" "}
                      kg CO₂eq/MJ
                    </div>
                    <div className="text-soil-600">Impacto do Amido:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.agricultural.cornStarchImpactPerMJ,
                        6
                      )}{" "}
                      kg CO₂eq/MJ
                    </div>
                    <div className="text-soil-600">Impacto MUT:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(computed.agricultural.mutImpactPerMJ, 6)} kg
                      CO₂eq/MJ
                    </div>
                    <div className="text-soil-600">Impacto do Transporte:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.agricultural.transportImpactPerMJ,
                        6
                      )}{" "}
                      kg CO₂eq/MJ
                    </div>
                    <div className="text-soil-600 font-semibold">
                      Total Agrícola:
                    </div>
                    <div className="font-bold text-forest-700">
                      {formatNumber(computed.agricultural.totalImpactPerMJ, 6)}{" "}
                      kg CO₂eq/MJ
                    </div>
                  </div>
                </div>
              )}

              {computed?.industrial && (
                <div>
                  <h4 className="font-semibold text-forest-700 mb-2">
                    Fase Industrial
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-soil-600">
                      Impacto da Eletricidade:
                    </div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.industrial.electricityImpactYear,
                        2
                      )}{" "}
                      kg CO₂eq/ano
                    </div>
                    <div className="text-soil-600">
                      Impacto dos Combustíveis:
                    </div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(computed.industrial.fuelImpactYear, 2)} kg
                      CO₂eq/ano
                    </div>
                    <div className="text-soil-600">Impacto da Manufatura:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.industrial.manufacturingImpactYear,
                        2
                      )}{" "}
                      kg CO₂eq/ano
                    </div>
                    <div className="text-soil-600 font-semibold">
                      Total Industrial (ano):
                    </div>
                    <div className="font-bold text-forest-700">
                      {formatNumber(computed.industrial.totalImpactYear, 2)} kg
                      CO₂eq/ano
                    </div>
                    <div className="text-soil-600 font-semibold">
                      Impacto por MJ:
                    </div>
                    <div className="font-bold text-forest-700">
                      {formatNumber(computed.industrial.impactPerMJ, 6)} kg
                      CO₂eq/MJ
                    </div>
                  </div>
                </div>
              )}

              {computed?.distribution && (
                <div>
                  <h4 className="font-semibold text-forest-700 mb-2">
                    Fase de Distribuição
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-soil-600">Impacto Doméstico:</div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.distribution.domesticImpactYear,
                        2
                      )}{" "}
                      kg CO₂eq/ano
                    </div>
                    <div className="text-soil-600">
                      Impacto Exportação (Fábrica → Porto):
                    </div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.distribution.exportImpactFactoryToPortYear,
                        2
                      )}{" "}
                      kg CO₂eq/ano
                    </div>
                    <div className="text-soil-600">
                      Impacto Exportação (Porto → Mercado):
                    </div>
                    <div className="font-medium text-soil-800">
                      {formatNumber(
                        computed.distribution.exportImpactPortToMarketYear,
                        2
                      )}{" "}
                      kg CO₂eq/ano
                    </div>
                    <div className="text-soil-600 font-semibold">
                      Total Distribuição:
                    </div>
                    <div className="font-bold text-forest-700">
                      {formatNumber(computed.distribution.totalImpactYear, 2)}{" "}
                      kg CO₂eq/ano
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nota de Eficiência Energético-Ambiental Expandida */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className={`${efficiencyBorderColor} ${efficiencyBgColor} border-2`}
          >
            <CardHeader>
              <CardTitle
                className={`${efficiencyColor} flex items-center gap-2`}
              >
                <Award className="h-5 w-5" />
                Classificação Energético-Ambiental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${efficiencyColor} mb-2`}>
                    {efficiencyGrade}
                  </div>
                  <p className={`text-sm ${efficiencyColor} font-medium`}>
                    Nota de Eficiência
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-soil-600">Redução de Emissões:</span>
                    <span className={`font-bold ${efficiencyColor}`}>
                      {formatNumber(energyEfficiencyScore, 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-soil-600">
                      Intensidade de Carbono:
                    </span>
                    <span className="font-semibold text-soil-800">
                      {formatNumber(carbonIntensity, 4)} kg CO₂eq/MJ
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-soil-600">Benchmark (Diesel A):</span>
                    <span className="font-semibold text-soil-800">
                      {formatNumber(dieselIntensity, 4)} kg CO₂eq/MJ
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border-2 border-current">
                  <div className="text-xs text-soil-600 mb-1">
                    Escala de Classificação
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>A+ (≥400%)</span>
                      <span>A (350-399%)</span>
                      <span>B (300-349%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C (250-299%)</span>
                      <span>D (200-249%)</span>
                      <span>E (&lt;200%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-600 bg-linear-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Análise de Créditos de Carbono (CBIOs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-green-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-900">
                      Status de Elegibilidade
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reductionPercent > 100
                          ? "bg-green-600 text-white"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reductionPercent > 100
                        ? "✓ ELEGÍVEL"
                        : "⚠ ANÁLISE NECESSÁRIA"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-soil-600">
                        Redução Mínima (RenovaBio):
                      </span>
                      <span className="font-semibold">≥ 50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soil-600">Redução Atual:</span>
                      <span className="font-bold text-green-700">
                        {formatNumber(Math.abs(reductionPercent), 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-200">
                      <span className="text-soil-600 font-semibold">
                        Excedente:
                      </span>
                      <span className="font-bold text-green-800">
                        +{formatNumber(Math.abs(reductionPercent) - 50, 1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900 mb-2">
                    Estimativa de CBIOs (10.000 ton/ano)
                  </div>
                  <div className="text-xs text-soil-600 mb-3">
                    Baseado em produção anual de usina de médio porte
                  </div>

                  {reductionPercent > 100 ? (
                    <>
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {formatNumber(
                          (Math.abs(reductionPercent) / 100) * 10000,
                          0
                        )}
                      </div>
                      <div className="text-xs text-soil-600">
                        CBIOs potenciais/ano
                      </div>

                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="text-xs text-soil-600 mb-1">
                          Valor Estimado (R$ 80/CBIO)
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                          R${" "}
                          {formatNumber(
                            (Math.abs(reductionPercent) / 100) * 10000 * 80,
                            0
                          )}
                        </div>
                        <div className="text-xs text-green-700">
                          Receita potencial anual
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded">
                      Necessário alcançar redução mínima de 50% para
                      elegibilidade aos CBIOs
                    </div>
                  )}
                </div>

                {reductionPercent > 100 && (
                  <div className="text-xs text-green-800 bg-white p-3 rounded-lg border border-green-200">
                    <strong>Nota:</strong> Valores estimados com base no
                    programa RenovaBio. Consulte a ANP para certificação oficial
                    e cálculo preciso de CBIOs.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card de Insights e Recomendações */}
        <Card className="border-forest-600 bg-linear-to-br from-sage-50 to-white">
          <CardHeader>
            <CardTitle className="text-forest-700 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Insights e Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-forest-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-forest-600 rounded-full"></span>
                  Pontos Fortes
                </h4>
                <ul className="space-y-2 text-sm text-soil-700">
                  {reductionPercent > 300 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>
                        Excelente desempenho ambiental com redução superior a
                        300%
                      </span>
                    </li>
                  )}
                  {agricultureValue < totalContribution * 0.3 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>
                        Fase agrícola otimizada com baixo impacto relativo
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>
                      Elegível para créditos de carbono (CBIOs) no mercado
                      brasileiro
                    </span>
                  </li>
                  {industrialValue < totalContribution * 0.5 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>
                        Processo industrial eficiente em termos de emissões
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-forest-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-sage-500 rounded-full"></span>
                  Oportunidades de Melhoria
                </h4>
                <ul className="space-y-2 text-sm text-soil-700">
                  {agricultureValue > totalContribution * 0.5 && (
                    <li className="flex items-start gap-2">
                      <span className="text-sage-500 font-bold">•</span>
                      <span>
                        Otimizar práticas agrícolas para reduzir emissões da
                        biomassa
                      </span>
                    </li>
                  )}
                  {industrialValue > totalContribution * 0.5 && (
                    <li className="flex items-start gap-2">
                      <span className="text-sage-500 font-bold">•</span>
                      <span>
                        Investir em eficiência energética na fase industrial
                      </span>
                    </li>
                  )}
                  {distributionValue / 1000 > totalContribution * 0.2 && (
                    <li className="flex items-start gap-2">
                      <span className="text-sage-500 font-bold">•</span>
                      <span>
                        Otimizar logística de distribuição para reduzir pegada
                        de carbono
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-sage-500 font-bold">•</span>
                    <span>
                      Considerar certificação ISO 14064 para validação
                      internacional
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela Final - Resumo Completo com CFF */}
        <Card className="border-forest-600 bg-linear-to-br from-forest-50 to-white">
          <CardHeader>
            <CardTitle className="text-forest-700 text-xl">
              Resumo Final - Aplicação da Circular Footprint Formula (CFF)
            </CardTitle>
            <CardDescription>
              Resultados consolidados com cálculo de créditos elegíveis (CBIOs)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Intensidade de Carbono com CFF */}
              <div className="bg-white rounded-lg border-2 border-forest-600 p-6">
                <h3 className="text-lg font-semibold text-forest-700 mb-4">
                  Intensidade de Carbono do Biocombustível (kg CO₂eq/MJ)
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-forest-700 mb-2">
                    {formatNumber(carbonIntensity, 6)}
                  </div>
                  <p className="text-sm text-soil-600">
                    Considerando o ciclo de vida completo
                  </p>
                </div>
              </div>

              {/* Comparação com Combustíveis Fósseis Equivalentes */}
              <div className="bg-white rounded-lg border border-cedar-700 p-6">
                <h3 className="text-lg font-semibold text-forest-700 mb-4">
                  Comparação entre combustíveis fósseis equivalentes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-forest-600">
                        <th className="text-left py-3 px-4 font-semibold text-forest-700">
                          Métrica
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-forest-700">
                          Diesel A, Gasolina A e GNV
                          <br />
                          <span className="text-xs font-normal text-soil-600">
                            (Média ponderada)
                          </span>
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-forest-700">
                          Óleo combustível
                          <br />
                          <span className="text-xs font-normal text-soil-600">
                            pesado
                          </span>
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-forest-700">
                          Coque de
                          <br />
                          <span className="text-xs font-normal text-soil-600">
                            Petróleo
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4 font-medium text-soil-800">
                          Intensidade de Carbono do combustível fóssil (kg
                          CO₂eq/MJ)
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-soil-800">
                          {formatNumber(dieselIntensity, 3)}
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-soil-800">
                          {formatNumber(oleoIntensity, 3)}
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-soil-800">
                          {formatNumber(coqueIntensity, 3)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium text-soil-800">
                          Nota de Eficiência Energético-Ambiental
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-700">
                          {formatNumber(Math.abs(reductionPercent), 3)}
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-700">
                          {formatNumber(Math.abs(reductionOleo), 3)}
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-700">
                          {formatNumber(Math.abs(reductionCoque), 3)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-green-50">
                        <td className="py-3 px-4 font-medium text-soil-800">
                          Redução de emissões
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-800">
                          {formatNumber(Math.abs(reductionPercent) * 100, 2)}%
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-800">
                          {formatNumber(Math.abs(reductionOleo) * 100, 2)}%
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-green-800">
                          {formatNumber(Math.abs(reductionCoque) * 100, 2)}%
                        </td>
                      </tr>
                      <tr className="bg-linear-to-r from-green-100 to-emerald-100 border-b-2 border-green-600">
                        <td className="py-4 px-4 font-bold text-forest-800">
                          Possíveis créditos elegíveis (CBIOs)
                          <br />
                          <span className="text-xs font-normal text-soil-700">
                            Considerando usina de médio porte com produção anual
                            de 10.000 Ton
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="font-bold text-2xl text-green-800">
                            {formatNumber(
                              (Math.abs(reductionPercent) / 100) *
                                10000 *
                                0.456,
                              3
                            )}
                          </div>
                          <div className="text-xs text-soil-600 mt-1">
                            CBIOs/ano
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="font-bold text-2xl text-green-800">
                            {formatNumber(
                              (Math.abs(reductionOleo) / 100) * 10000 * 0.456,
                              3
                            )}
                          </div>
                          <div className="text-xs text-soil-600 mt-1">
                            CBIOs/ano
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="font-bold text-2xl text-green-800">
                            {formatNumber(
                              (Math.abs(reductionCoque) / 100) * 10000 * 0.457,
                              3
                            )}
                          </div>
                          <div className="text-xs text-soil-600 mt-1">
                            CBIOs/ano
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nota Informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 font-bold text-lg">ℹ️</div>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">
                      Nota sobre os cálculos:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>
                        A <strong>Circular Footprint Formula (CFF)</strong> foi
                        aplicada para calcular a intensidade de carbono do
                        biocombustível
                      </li>
                      <li>
                        Os valores de CBIOs consideram os fatores de conversão
                        específicos para cada tipo de combustível fóssil
                        substituído
                      </li>
                      <li>
                        A redução de emissões é calculada em relação ao
                        combustível fóssil equivalente
                      </li>
                      <li>
                        Para certificação oficial de CBIOs, consulte a ANP e
                        siga os procedimentos do programa RenovaBio
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Resumo Executivo Final */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-linear-to-br from-green-600 to-green-700 text-white rounded-lg p-6 shadow-lg">
                  <div className="text-sm font-medium mb-2 opacity-90">
                    Média de Redução
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    {formatNumber(
                      ((Math.abs(reductionPercent) +
                        Math.abs(reductionOleo) +
                        Math.abs(reductionCoque)) /
                        3) *
                        100,
                      1
                    )}
                    %
                  </div>
                  <div className="text-xs opacity-80">
                    vs combustíveis fósseis
                  </div>
                </div>

                <div className="bg-linear-to-br from-emerald-600 to-emerald-700 text-white rounded-lg p-6 shadow-lg">
                  <div className="text-sm font-medium mb-2 opacity-90">
                    CBIOs Médios Estimados
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    {formatNumber(
                      ((Math.abs(reductionPercent) / 100) * 10000 * 0.456 +
                        (Math.abs(reductionOleo) / 100) * 10000 * 0.456 +
                        (Math.abs(reductionCoque) / 100) * 10000 * 0.457) /
                        3,
                      0
                    )}
                  </div>
                  <div className="text-xs opacity-80">CBIOs potenciais/ano</div>
                </div>

                <div className="bg-linear-to-br from-teal-600 to-teal-700 text-white rounded-lg p-6 shadow-lg">
                  <div className="text-sm font-medium mb-2 opacity-90">
                    Receita Potencial (R$ 80/CBIO)
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    R${" "}
                    {formatNumber(
                      (((Math.abs(reductionPercent) / 100) * 10000 * 0.456 +
                        (Math.abs(reductionOleo) / 100) * 10000 * 0.456 +
                        (Math.abs(reductionCoque) / 100) * 10000 * 0.457) /
                        3) *
                        80,
                      0
                    )}
                  </div>
                  <div className="text-xs opacity-80">Valor anual estimado</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Fim do container de exportação */}
    </div>
  )
}
