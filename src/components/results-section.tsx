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
import { TrendingDown } from "lucide-react"
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
      fill: "hsl(var(--chart-1))",
    },
    {
      phase: "Industrial",
      value: industrialValue,
      fill: "hsl(var(--chart-2))",
    },
    {
      phase: "Distribuição",
      value: distributionValue / 1000,
      fill: "hsl(var(--chart-3))",
    },
  ]

  const pieConfig: ChartConfig = {
    value: {
      label: "Impacto (kg CO₂eq/MJ)",
    },
    agricola: {
      label: "Agrícola",
      color: "hsl(var(--chart-1))",
    },
    industrial: {
      label: "Industrial",
      color: "hsl(var(--chart-2))",
    },
    distribuicao: {
      label: "Distribuição",
      color: "hsl(var(--chart-3))",
    },
  }

  // Dados para gráfico de barras - Detalhamento da fase agrícola
  const agricultureDetailData = computed?.agricultural
    ? [
        {
          category: "Biomassa",
          value: computed.agricultural.biomassImpactPerMJ,
          fill: "hsl(var(--chart-1))",
        },
        {
          category: "Amido",
          value: computed.agricultural.cornStarchImpactPerMJ,
          fill: "hsl(var(--chart-2))",
        },
        {
          category: "MUT",
          value: computed.agricultural.mutImpactPerMJ,
          fill: "hsl(var(--chart-3))",
        },
        {
          category: "Transporte",
          value: computed.agricultural.transportImpactPerMJ,
          fill: "hsl(var(--chart-4))",
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
          fill: "hsl(var(--chart-1))",
        },
        {
          category: "Combustível",
          value: computed.industrial.fuelImpactYear,
          fill: "hsl(var(--chart-2))",
        },
        {
          category: "Manufatura",
          value: computed.industrial.manufacturingImpactYear,
          fill: "hsl(var(--chart-3))",
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
      fill: "hsl(var(--chart-5))",
    },
    {
      fuel: "Óleo Pesado",
      value: 0.094,
      fill: "hsl(var(--chart-5))",
    },
    {
      fuel: "Coque de Petróleo",
      value: 0.12,
      fill: "hsl(var(--chart-5))",
    },
    {
      fuel: biomassType || "Biocombustível",
      value: carbonIntensity,
      fill: "hsl(var(--chart-1))",
    },
  ]

  const comparisonConfig: ChartConfig = {
    value: {
      label: "Intensidade (kg CO₂eq/MJ)",
    },
  }

  // Cálculo de redução de emissões
  const dieselIntensity = 0.0867
  const reductionPercent =
    ((dieselIntensity - carbonIntensity) / dieselIntensity) * 100

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartContainer>
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
                    {formatNumber(computed.agricultural.biomassImpactPerMJ, 6)}{" "}
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
                    {formatNumber(computed.agricultural.totalImpactPerMJ, 6)} kg
                    CO₂eq/MJ
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
                  <div className="text-soil-600">Impacto da Eletricidade:</div>
                  <div className="font-medium text-soil-800">
                    {formatNumber(computed.industrial.electricityImpactYear, 2)}{" "}
                    kg CO₂eq/ano
                  </div>
                  <div className="text-soil-600">Impacto dos Combustíveis:</div>
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
                    {formatNumber(computed.distribution.domesticImpactYear, 2)}{" "}
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
                    {formatNumber(computed.distribution.totalImpactYear, 2)} kg
                    CO₂eq/ano
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nota de Eficiência Energético-Ambiental */}
      <Card className="border-green-600 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Nota de Eficiência Energético-Ambiental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-green-900">
              O biocombustível analisado apresenta uma{" "}
              <span className="font-bold">
                redução de {formatNumber(Math.abs(reductionPercent), 2)}%
              </span>{" "}
              nas emissões de CO₂ quando comparado ao Diesel A.
            </p>
            {reductionPercent > 100 && (
              <p className="text-sm text-green-900">
                Este resultado demonstra uma excelente eficiência
                energético-ambiental, com impacto significativamente menor que
                combustíveis fósseis equivalentes.
              </p>
            )}
            <div className="mt-4 p-3 bg-white rounded-md border border-green-200">
              <div className="text-sm font-medium text-green-900">
                Possíveis Créditos Elegíveis (CBIOs)
              </div>
              <div className="text-xs text-green-700 mt-1">
                Considerando usina de médio porte com produção anual de 10.000
                toneladas
              </div>
              <div className="text-2xl font-bold text-green-800 mt-2">
                {reductionPercent > 100 ? "Elegível" : "Não elegível"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
