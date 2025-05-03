import React, { useState } from 'react'
import proposalService from '../../services/proposalService'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ExportOptionsProps {
  currentFilters: any
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ currentFilters }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf' | null>(
    null
  )

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setExportType(format)
      setIsExporting(true)

      const blob = await proposalService.exportProposals(currentFilters)

      // Criar um URL temporário para o download
      const url = window.URL.createObjectURL(blob)

      // Criar um elemento de link para iniciar o download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `propostas_celebra_${new Date().toISOString().split('T')[0]}.${format}`
      )

      // Trigger do download
      document.body.appendChild(link)
      link.click()

      // Limpeza
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar propostas:', error)
      alert('Não foi possível exportar os dados. Tente novamente mais tarde.')
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
        Exportar como:
      </span>

      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-celebra-blue"
      >
        {isExporting && exportType === 'csv' ? (
          <LoadingSpinner size="small" color="primary" className="mr-1" />
        ) : (
          'CSV'
        )}
      </button>

      <button
        onClick={() => handleExport('excel')}
        disabled={isExporting}
        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-celebra-blue"
      >
        {isExporting && exportType === 'excel' ? (
          <LoadingSpinner size="small" color="primary" className="mr-1" />
        ) : (
          'Excel'
        )}
      </button>

      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-celebra-blue"
      >
        {isExporting && exportType === 'pdf' ? (
          <LoadingSpinner size="small" color="primary" className="mr-1" />
        ) : (
          'PDF'
        )}
      </button>
    </div>
  )
}

export default ExportOptions
