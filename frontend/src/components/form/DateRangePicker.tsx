import React, { useState } from 'react'

interface DateRangePickerProps {
  value: {
    startDate: Date
    endDate: Date
  }
  onChange: (range: { startDate: Date; endDate: Date }) => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localRange, setLocalRange] = useState({
    startDate: value.startDate,
    endDate: value.endDate,
  })

  const presetRanges = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 90 dias', days: 90 },
  ]

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR')
  }

  const handlePresetClick = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const newRange = { startDate, endDate }
    setLocalRange(newRange)
    onChange(newRange)
    setIsOpen(false)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value)
    setLocalRange((prev) => ({
      ...prev,
      startDate: newStartDate,
    }))
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value)
    setLocalRange((prev) => ({
      ...prev,
      endDate: newEndDate,
    }))
  }

  const handleApply = () => {
    onChange(localRange)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" data-testid="last-month-option">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formatDate(value.startDate)} - {formatDate(value.endDate)}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 w-80">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={localRange.startDate.toISOString().split('T')[0]}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data final
              </label>
              <input
                type="date"
                value={localRange.endDate.toISOString().split('T')[0]}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Períodos predefinidos:
            </p>
            {presetRanges.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => handlePresetClick(range.days)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
