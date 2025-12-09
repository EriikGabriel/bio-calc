"use client"

import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import { Download, Loader2 } from "lucide-react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
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

      // Criar o PDF com pdf-lib
      const imgData = canvas.toDataURL("image/png")
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595.28, 841.89]) // A4 size in points
      const { width, height } = page.getSize()

      // Adicionar cabeçalho
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText("Relatório de Análise do Ciclo de Vida", {
        x: width / 2 - 180,
        y: height - 50,
        size: 24,
        font,
        color: rgb(0.37, 0.55, 0.38),
      })
      let y = height - 80
      if (companyName) {
        page.drawText(`Empresa: ${companyName}`, {
          x: width / 2 - 100,
          y,
          size: 14,
          font: fontRegular,
          color: rgb(0.23, 0.2, 0.17),
        })
        y -= 20
      }
      if (biomassType) {
        page.drawText(`Biomassa: ${biomassType}`, {
          x: width / 2 - 100,
          y,
          size: 14,
          font: fontRegular,
          color: rgb(0.23, 0.2, 0.17),
        })
        y -= 20
      }
      page.drawText(
        `Gerado em: ${new Date().toLocaleDateString(
          "pt-BR"
        )} às ${new Date().toLocaleTimeString("pt-BR")}`,
        {
          x: width / 2 - 150,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        }
      )

      // Adicionar imagem do conteúdo
      const pngImage = await pdfDoc.embedPng(imgData)
      const imgWidth = width - 40
      const imgHeight = (pngImage.height * imgWidth) / pngImage.width
      page.drawImage(pngImage, {
        x: 20,
        y: y - imgHeight - 30,
        width: imgWidth,
        height: imgHeight,
      })

      // Adicionar rodapé
      page.drawText(
        `Bio-Calc - Análise de Ciclo de Vida de Biocombustíveis | Página 1 de 1`,
        {
          x: width / 2 - 180,
          y: 20,
          size: 8,
          font: fontRegular,
          color: rgb(0.6, 0.6, 0.6),
        }
      )

      // Salvar o PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([Uint8Array.from(pdfBytes)], {
        type: "application/pdf",
      })
      const link = document.createElement("a")
      const timestamp = new Date().toISOString().split("T")[0]
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}-${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
