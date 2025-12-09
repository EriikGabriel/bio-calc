"use client"

import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

type ExportPDFButtonProps = {
  elementId: string
  fileName?: string
  companyName?: string
  biomassType?: string
}

export function ExportPDFButton({
  elementId,
  fileName = "relatorio-biocombustivel",
  companyName,
  biomassType,
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)

      // Buscar o elemento a ser exportado
      const element = document.getElementById(elementId)
      if (!element) {
        console.error("Elemento não encontrado")
        return
      }

      // Criar um clone do elemento para não afetar a visualização
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      clone.style.width = "1200px" // Largura fixa para melhor renderização
      document.body.appendChild(clone)

      // Converter cores oklch para hex/rgb antes de capturar
      const convertOklchToRgb = (element: HTMLElement) => {
        const allElements = element.querySelectorAll("*")
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          const computedStyle = window.getComputedStyle(htmlEl)

          // Converter cores de fundo
          const bgColor = computedStyle.backgroundColor
          if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
            htmlEl.style.backgroundColor = bgColor
          }

          // Converter cores de texto
          const textColor = computedStyle.color
          if (textColor) {
            htmlEl.style.color = textColor
          }

          // Converter cores de borda
          const borderColor = computedStyle.borderColor
          if (borderColor) {
            htmlEl.style.borderColor = borderColor
          }
        })
      }

      convertOklchToRgb(clone)

      // Aguardar um momento para garantir que tudo foi renderizado
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Capturar o elemento como imagem
      const canvas = await html2canvas(clone, {
        scale: 2, // Maior qualidade
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Garantir que todas as cores computadas sejam aplicadas
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement) {
            convertOklchToRgb(clonedElement)
          }
        },
      })

      // Remover o clone
      document.body.removeChild(clone)

      // Criar o PDF
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      const pdf = new jsPDF("p", "mm", "a4")
      let position = 0

      // Adicionar cabeçalho personalizado na primeira página
      pdf.setFontSize(20)
      pdf.setTextColor(94, 140, 97) // forest-600
      pdf.text("Relatório de Análise do Ciclo de Vida", 105, 15, {
        align: "center",
      })

      pdf.setFontSize(12)
      pdf.setTextColor(59, 50, 44) // soil-800

      if (companyName) {
        pdf.text(`Empresa: ${companyName}`, 105, 25, { align: "center" })
      }
      if (biomassType) {
        pdf.text(`Biomassa: ${biomassType}`, 105, 32, { align: "center" })
      }

      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString(
          "pt-BR"
        )} às ${new Date().toLocaleTimeString("pt-BR")}`,
        105,
        40,
        { align: "center" }
      )

      // Linha separadora
      pdf.setDrawColor(94, 140, 97)
      pdf.setLineWidth(0.5)
      pdf.line(20, 45, 190, 45)

      // Adicionar a imagem do conteúdo
      const imgData = canvas.toDataURL("image/png")
      position = 50 // Começar após o cabeçalho

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - position

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10 // Margem superior nas páginas seguintes
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Adicionar rodapé em todas as páginas
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Bio-Calc - Análise de Ciclo de Vida de Biocombustíveis | Página ${i} de ${totalPages}`,
          105,
          290,
          { align: "center" }
        )
      }

      // Salvar o PDF
      const timestamp = new Date().toISOString().split("T")[0]
      pdf.save(`${fileName}-${timestamp}.pdf`)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar o PDF. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting}
      className="bg-forest-600 hover:bg-forest-700 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar Resultados em PDF
        </>
      )}
    </Button>
  )
}
