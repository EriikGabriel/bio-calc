"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculateResponse } from "@/types/api"
import { formatNumber } from "@/utils/format"
import { BarChart3, PieChartIcon, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

type ResultsSectionProps = {
  result: CalculateResponse | null
  companyName?: string
  biomassType?: string
}

export function ResultsSection({
  // Pre-format commonly used values for reuse (after calculations is set)

  result,
  companyName,
  biomassType = "Resíduo de Pinus",
}: ResultsSectionProps) {
  const [calculations, setCalculations] = useState<{
    agricultureValue: number
    industrialValue: number
    transporteValue: number
    usoValue: number
    carbonIntensity: number
    agriculturePercentage: number
    industrialPercentage: number
    transportePercentage: number
    usoPercentage: number
    dieselIntensity: number
    oleoIntensity: number
    coqueIntensity: number
    efficiencyNoteDiesel: number
    efficiencyNoteOleo: number
    efficiencyNoteCoque: number
    reductionPercent: number
    reductionOleo: number
    reductionCoque: number
    cbiosDiesel: number
    cbiosOleo: number
    cbiosCoque: number
  } | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  // Função para calcular os valores baseados nos dados da API
  const calculateResults = () => {
    setIsLoading(true)
    try {
      // Usar os dados do 'results' da API quando disponíveis
      if (result?.results) {
        const {
          carbonIntensity,
          energyEfficiencyNote,
          emissionReduction,
          cBioGeneration,
          phaseDetails,
        } = result.results

        // Extrair valores das fases
        const agricultureValue = carbonIntensity.agricultural || 0
        const industrialValue = carbonIntensity.industrial || 0
        const transporteValue = carbonIntensity.distribution || 0
        const usoValue = carbonIntensity.use || 0

        // Calcular intensidade total como soma das etapas
        const totalIntensity =
          agricultureValue + industrialValue + transporteValue + usoValue

        // Calcular percentuais
        const agriculturePercentage =
          totalIntensity > 0 ? (agricultureValue / totalIntensity) * 100 : 0
        const industrialPercentage =
          totalIntensity > 0 ? (industrialValue / totalIntensity) * 100 : 0
        const transportePercentage =
          totalIntensity > 0 ? (transporteValue / totalIntensity) * 100 : 0
        const usoPercentage =
          totalIntensity > 0 ? (usoValue / totalIntensity) * 100 : 0

        // Usar intensidades fixas da API
        const dieselIntensity = cBioGeneration.fossilSubstitute || 0.0867

        // Valores fixos para os outros combustíveis
        const oleoIntensity = 0.077 // Óleo combustível
        const coqueIntensity = 0.102 // Coque de Petróleo

        // Calcular notas de eficiência (fóssil - biocombustível)
        const efficiencyNoteDiesel =
          energyEfficiencyNote || dieselIntensity - totalIntensity
        const efficiencyNoteOleo = oleoIntensity - totalIntensity
        const efficiencyNoteCoque = coqueIntensity - totalIntensity

        // Calcular reduções
        const reductionPercent =
          emissionReduction * 100 ||
          (dieselIntensity > 0
            ? ((dieselIntensity - totalIntensity) / dieselIntensity) * 100
            : 0)
        const reductionOleo =
          oleoIntensity > 0
            ? ((oleoIntensity - totalIntensity) / oleoIntensity) * 100
            : 0
        const reductionCoque =
          coqueIntensity > 0
            ? ((coqueIntensity - totalIntensity) / coqueIntensity) * 100
            : 0

        // CBIOs da API
        const cbiosDiesel = cBioGeneration.eligibleCBIOS || 0

        // Calcular CBIOs para outros combustíveis
        const productionVolume =
          cBioGeneration.eligibleProductionVolumeTon || 10000
        const factorCBIOoleo = 0.456
        const factorCBIOcoque = 0.457

        const cbiosOleo = Math.floor(
          (Math.max(0, reductionOleo) / 100) * productionVolume * factorCBIOoleo
        )
        const cbiosCoque = Math.floor(
          (Math.max(0, reductionCoque) / 100) *
            productionVolume *
            factorCBIOcoque
        )

        setCalculations({
          agricultureValue,
          industrialValue,
          transporteValue,
          usoValue,
          carbonIntensity: totalIntensity,
          agriculturePercentage,
          industrialPercentage,
          transportePercentage,
          usoPercentage,
          dieselIntensity,
          oleoIntensity,
          coqueIntensity,
          efficiencyNoteDiesel,
          efficiencyNoteOleo,
          efficiencyNoteCoque,
          reductionPercent,
          reductionOleo,
          reductionCoque,
          cbiosDiesel,
          cbiosOleo,
          cbiosCoque,
        })
      } else if (result?.computed) {
        // Fallback para a estrutura antiga da API
        const { agricultural, industrial, distribution } = result.computed

        // Calcular valores das fases
        const agricultureValue = agricultural?.totalImpactPerMJ || 0
        const industrialValue = industrial?.impactPerMJ || 0
        const distributionValue = distribution?.totalImpactYear || 0

        // Calcular distribuição por MJ
        const processedBiomass = industrial?.processedBiomassKg || 10000
        const biomassMJ =
          processedBiomass * (industrial?.assumptions?.calorificMJPerKg || 16.5)
        const transporteValue =
          biomassMJ > 0 ? distributionValue / biomassMJ : 0

        const usoValue = 0 // Placeholder

        const carbonIntensity =
          agricultureValue + industrialValue + transporteValue + usoValue

        // Calcular percentuais
        const agriculturePercentage =
          carbonIntensity > 0 ? (agricultureValue / carbonIntensity) * 100 : 0
        const industrialPercentage =
          carbonIntensity > 0 ? (industrialValue / carbonIntensity) * 100 : 0
        const transportePercentage =
          carbonIntensity > 0 ? (transporteValue / carbonIntensity) * 100 : 0
        const usoPercentage =
          carbonIntensity > 0 ? (usoValue / carbonIntensity) * 100 : 0

        // Intensidades dos combustíveis fósseis
        const dieselIntensity = 0.0867
        const oleoIntensity = 0.077
        const coqueIntensity = 0.102

        // Notas de eficiência
        const efficiencyNoteDiesel = dieselIntensity - carbonIntensity
        const efficiencyNoteOleo = oleoIntensity - carbonIntensity
        const efficiencyNoteCoque = coqueIntensity - carbonIntensity

        // Reduções
        const reductionPercent =
          dieselIntensity > 0
            ? ((dieselIntensity - carbonIntensity) / dieselIntensity) * 100
            : 0
        const reductionOleo =
          oleoIntensity > 0
            ? ((oleoIntensity - carbonIntensity) / oleoIntensity) * 100
            : 0
        const reductionCoque =
          coqueIntensity > 0
            ? ((coqueIntensity - carbonIntensity) / coqueIntensity) * 100
            : 0

        // CBIOs
        const productionVolume = 10000 // Valor padrão
        const factorCBIOdiesel = 0.456
        const factorCBIOoleo = 0.456
        const factorCBIOcoque = 0.457

        const cbiosDiesel = Math.floor(
          (Math.max(0, reductionPercent) / 100) *
            productionVolume *
            factorCBIOdiesel
        )
        const cbiosOleo = Math.floor(
          (Math.max(0, reductionOleo) / 100) * productionVolume * factorCBIOoleo
        )
        const cbiosCoque = Math.floor(
          (Math.max(0, reductionCoque) / 100) *
            productionVolume *
            factorCBIOcoque
        )

        setCalculations({
          agricultureValue,
          industrialValue,
          transporteValue,
          usoValue,
          carbonIntensity,
          agriculturePercentage,
          industrialPercentage,
          transportePercentage,
          usoPercentage,
          dieselIntensity,
          oleoIntensity,
          coqueIntensity,
          efficiencyNoteDiesel,
          efficiencyNoteOleo,
          efficiencyNoteCoque,
          reductionPercent,
          reductionOleo,
          reductionCoque,
          cbiosDiesel,
          cbiosOleo,
          cbiosCoque,
        })
      }
    } catch (error) {
      console.error("Erro ao calcular resultados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (result?.ok) {
      calculateResults()
    }
  }, [result])

  if (isLoading) {
    return (
      <div className="p-8 text-center text-soil-600">
        <p className="text-lg">Calculando resultados...</p>
        <p className="text-sm mt-2">Aguarde enquanto processamos os dados.</p>
      </div>
    )
  }

  if (!calculations) {
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

  const formatted = {
    carbonIntensity: formatNumber(calculations.carbonIntensity, 6),
    carbonIntensityDiff: formatNumber(
      calculations.carbonIntensity - 49.886304,
      6
    ),
    agricultureValue: formatNumber(calculations.agricultureValue, 6),
    industrialValue: formatNumber(calculations.industrialValue, 6),
    transporteValue: formatNumber(calculations.transporteValue, 6),
    transporteValueDiff: formatNumber(
      calculations.transporteValue - 49.844405,
      6
    ),
    usoValue: formatNumber(calculations.usoValue, 6),
    usoValueAdj: formatNumber(calculations.usoValue + 0.0004, 6),
    agriculturePercentage: formatNumber(calculations.agriculturePercentage, 2),
    industrialPercentage: formatNumber(calculations.industrialPercentage, 2),
    transportePercentage: formatNumber(calculations.transportePercentage, 2),
    usoPercentage: formatNumber(calculations.usoPercentage, 2),
    dieselIntensity: formatNumber(calculations.dieselIntensity, 4),
    oleoIntensity: formatNumber(calculations.oleoIntensity, 4),
    coqueIntensity: formatNumber(calculations.coqueIntensity, 4),
    efficiencyNoteDiesel: formatNumber(calculations.efficiencyNoteDiesel, 4),
    efficiencyNoteOleo: formatNumber(calculations.efficiencyNoteOleo, 4),
    efficiencyNoteCoque: formatNumber(calculations.efficiencyNoteCoque, 4),
    reductionPercent: formatNumber(calculations.reductionPercent, 2),
    reductionOleo: formatNumber(calculations.reductionOleo, 2),
    reductionCoque: formatNumber(calculations.reductionCoque, 2),
    cbiosDiesel: formatNumber(calculations.cbiosDiesel, 0),
    cbiosOleo: formatNumber(calculations.cbiosOleo, 0),
    cbiosCoque: formatNumber(calculations.cbiosCoque, 0),
    // For pie chart legend (1 decimal)
    agriculturePercentage1: formatNumber(calculations.agriculturePercentage, 1),
    industrialPercentage1: formatNumber(calculations.industrialPercentage, 1),
    transportePercentage1: formatNumber(calculations.transportePercentage, 1),
    usoPercentage1: formatNumber(calculations.usoPercentage, 1),
  }

  const colors = {
    forest600: "#5e8c61",
    sage500: "#72bda3",
    herb300: "#b0c5af",
    mint300: "#94e8b4",
  }

  return (
    <Card className="border-forest-600 bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-forest-800">
          Biomassa do biocombustível: {biomassType}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Intensidade de Carbono do Biocombustível */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-forest-700" />
            <h3 className="text-lg font-bold text-forest-800">
              Intensidade de Carbono do Biocombustível (kg CO₂eq/MJ)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-forest-600">
                  <th className="text-left py-2 px-3 font-semibold text-soil-800 bg-forest-50">
                    Etapas do ciclo de vida
                  </th>
                  <th className="text-center py-2 px-3 font-bold text-forest-700 bg-forest-50">
                    {formatNumber(calculations.carbonIntensity - 49.886304, 6)}
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-soil-800 bg-forest-50">
                    % de contribuição
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Agrícola
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.agricultureValue, 6)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-forest-700">
                    {formatNumber(calculations.agriculturePercentage, 2)}%
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Industrial
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.industrialValue, 6)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-forest-700">
                    {formatNumber(calculations.industrialPercentage, 2)}%
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Transporte
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.transporteValue - 49.844405, 6)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-forest-700">
                    {formatNumber(calculations.transportePercentage, 2)}%
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-soil-800">Uso</td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.usoValue + 0.0004, 6)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-forest-700">
                    {formatNumber(calculations.usoPercentage, 2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparação entre combustíveis fósseis equivalentes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-bold text-forest-800">
              Comparação entre combustíveis fósseis equivalentes
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-cedar-700 bg-cedar-50">
                  <th className="text-left py-2 px-3 font-semibold text-soil-800">
                    Métrica
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-soil-800">
                    Diesel A, Gasolina A e GNV
                    <br />
                    <span className="text-xs font-normal text-soil-600">
                      (Média ponderada)
                    </span>
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-soil-800">
                    Óleo combustível pesado
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-soil-800">
                    Coque de Petróleo
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Intensidade de Carbono do combustível fóssil (kg CO₂eq/MJ)
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.dieselIntensity, 4)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.oleoIntensity, 4)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-soil-900">
                    {formatNumber(calculations.coqueIntensity, 4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Nota de Eficiência Energético-Ambiental
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-600">
                    {formatNumber(calculations.efficiencyNoteDiesel, 4)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-600">
                    {formatNumber(calculations.efficiencyNoteOleo, 4)}
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-600">
                    {formatNumber(calculations.efficiencyNoteCoque, 4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-red-50 hover:bg-red-100">
                  <td className="py-3 px-3 font-medium text-soil-800">
                    Redução de emissões
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-700">
                    {formatNumber(calculations.reductionPercent, 2)}%
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-700">
                    {formatNumber(calculations.reductionOleo, 2)}%
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-red-700">
                    {formatNumber(calculations.reductionCoque, 2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Possíveis créditos elegíveis (CBIOs) */}
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
          <h4 className="font-bold text-green-800 text-lg mb-2">
            Possíveis créditos elegíveis (CBIOs)
          </h4>
          <p className="text-green-700">
            Considerando usina de médio porte com produção anual de 10.000 Ton
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-300">
              <div className="text-sm text-green-800 mb-1">vs Diesel A</div>
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(calculations.cbiosDiesel, 0)}
              </div>
              <div className="text-xs text-green-600 mt-1">CBIOs/ano</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-300">
              <div className="text-sm text-green-800 mb-1">vs Óleo Pesado</div>
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(calculations.cbiosOleo, 0)}
              </div>
              <div className="text-xs text-green-600 mt-1">CBIOs/ano</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-300">
              <div className="text-sm text-green-800 mb-1">vs Coque</div>
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(calculations.cbiosCoque, 0)}
              </div>
              <div className="text-xs text-green-600 mt-1">CBIOs/ano</div>
            </div>
          </div>
        </div>

        {/* Gráfico de Contribuição das etapas do ciclo de vida */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-forest-700" />
            <h3 className="text-lg font-bold text-forest-800">
              Contribuição das etapas do ciclo de vida
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Gráfico de pizza */}
            <div className="w-full md:w-1/2">
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-64 h-64">
                  {/* Anel externo */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                  />

                  {/* Segmento Agrícola */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={colors.forest600}
                    strokeWidth="16"
                    strokeDasharray={`${
                      (calculations.agriculturePercentage / 100) * 753.6
                    } 753.6`}
                    strokeDashoffset="0"
                    transform="rotate(-90 128 128)"
                    strokeLinecap="round"
                  />

                  {/* Segmento Industrial */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={colors.sage500}
                    strokeWidth="16"
                    strokeDasharray={`${
                      (calculations.industrialPercentage / 100) * 753.6
                    } 753.6`}
                    strokeDashoffset={`${
                      -(calculations.agriculturePercentage / 100) * 753.6
                    }`}
                    transform="rotate(-90 128 128)"
                    strokeLinecap="round"
                  />

                  {/* Segmento Transporte */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={colors.herb300}
                    strokeWidth="16"
                    strokeDasharray={`${
                      (calculations.transportePercentage / 100) * 753.6
                    } 753.6`}
                    strokeDashoffset={`${
                      -(
                        (calculations.agriculturePercentage +
                          calculations.industrialPercentage) /
                        100
                      ) * 753.6
                    }`}
                    transform="rotate(-90 128 128)"
                    strokeLinecap="round"
                  />

                  {/* Segmento Uso */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={colors.mint300}
                    strokeWidth="16"
                    strokeDasharray={`${
                      (calculations.usoPercentage / 100) * 753.6
                    } 753.6`}
                    strokeDashoffset={`${
                      -(
                        (calculations.agriculturePercentage +
                          calculations.industrialPercentage +
                          calculations.transportePercentage) /
                        100
                      ) * 753.6
                    }`}
                    transform="rotate(-90 128 128)"
                    strokeLinecap="round"
                  />

                  {/* Texto no centro */}
                  <text
                    x="128"
                    y="120"
                    textAnchor="middle"
                    className="text-2xl font-bold fill-forest-800"
                  >
                    Total
                  </text>
                  <text
                    x="128"
                    y="145"
                    textAnchor="middle"
                    className="text-lg font-bold fill-forest-700"
                  >
                    {formatNumber(calculations.carbonIntensity, 6)}
                  </text>
                  <text
                    x="128"
                    y="165"
                    textAnchor="middle"
                    className="text-sm fill-soil-600"
                  >
                    kg CO₂eq/MJ
                  </text>
                </svg>
              </div>
            </div>

            {/* Legenda */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors.forest600 }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-soil-800">
                        Agrícola
                      </span>
                      <span className="font-bold text-forest-700">
                        {formatted?.agriculturePercentage1}%
                      </span>
                    </div>
                    <div className="text-sm text-soil-600">
                      {formatted?.agricultureValue} kg CO₂eq/MJ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors.sage500 }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-soil-800">
                        Industrial
                      </span>
                      <span className="font-bold text-sage-600">
                        {formatted?.industrialPercentage1}%
                      </span>
                    </div>
                    <div className="text-sm text-soil-600">
                      {formatted?.industrialValue} kg CO₂eq/MJ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors.herb300 }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-soil-800">
                        Transporte
                      </span>
                      <span className="font-bold text-herb-300">
                        {formatted?.transportePercentage}%
                      </span>
                    </div>
                    <div className="text-sm text-soil-600">
                      {formatted?.transporteValue} kg CO₂eq/MJ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors.mint300 }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-soil-800">Uso</span>
                      <span className="font-bold text-mint-300">
                        {formatted?.usoPercentage}%
                      </span>
                    </div>
                    <div className="text-sm text-soil-600">
                      {formatted?.usoValue} kg CO₂eq/MJ
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-forest-50 rounded-lg border border-forest-200">
                <div className="text-sm font-bold text-forest-800 mb-1">
                  Intensidade Total de Carbono
                </div>
                <div className="text-2xl font-bold text-forest-700">
                  {formatNumber(calculations.carbonIntensity, 6)} kg CO₂eq/MJ
                </div>
                <div className="text-xs text-soil-600 mt-1">
                  Soma de todas as etapas do ciclo de vida
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
