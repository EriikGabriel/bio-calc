import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { BarChart3, Calculator, Leaf, TrendingDown } from "lucide-react"

export function OverviewSection() {
  return (
    <TabsContent
      value="overview"
      className="border-cedar-700 bg-green-50/60 border rounded-2xl min-h-80 text-soil-800 p-5"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-forest-700 mb-2">
            Calculadora de Eficiência Energético-Ambiental
          </h1>
          <p className="text-lg text-soil-600">
            Avalie a sustentabilidade de biocombustíveis sólidos (Pellets e
            Briquetes)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-cedar-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <CardTitle className="text-forest-700">Sustentável</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analise o ciclo de vida completo dos biocombustíveis desde a
                origem da biomassa até a distribuição final
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-cedar-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-forest-700">Preciso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cálculos baseados em metodologias científicas e fatores de
                emissão atualizados
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-cedar-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-forest-700">Visual</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Resultados apresentados através de gráficos interativos e
                relatórios detalhados
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="border-cedar-700">
          <CardHeader>
            <CardTitle className="text-forest-700">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className=" w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-forest-700">
                  Informações da Empresa
                </h3>
                <p className="text-sm text-soil-600">
                  Preencha os dados básicos da empresa produtora de
                  biocombustíveis
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-forest-700">Fase Agrícola</h3>
                <p className="text-sm text-soil-600">
                  Informe sobre a origem da biomassa, tipo de cultivo,
                  transporte e fatores de impacto
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-forest-700">
                  Fase Industrial
                </h3>
                <p className="text-sm text-soil-600">
                  Detalhe o processo de produção, consumo energético,
                  combustíveis utilizados e cogeração
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-forest-700">Distribuição</h3>
                <p className="text-sm text-soil-600">
                  Forneça informações sobre transporte doméstico e exportação do
                  produto final
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-700">Resultados</h3>
                <p className="text-sm text-soil-600">
                  Visualize a intensidade de carbono, comparações com
                  combustíveis fósseis, reduções de emissões e muito mais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-600 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              Benefícios da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-900">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Identifique oportunidades de redução de emissões em cada fase
                  do ciclo de vida
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Comprove a eficiência energético-ambiental dos seus
                  biocombustíveis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Avalie elegibilidade para créditos de descarbonização (CBIOs)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Compare o desempenho ambiental com combustíveis fósseis
                  equivalentes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Gere relatórios visuais para comunicar seus resultados de
                  sustentabilidade
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}
