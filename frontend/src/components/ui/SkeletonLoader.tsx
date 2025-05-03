import React from 'react'

type SkeletonType =
  | 'text'
  | 'avatar'
  | 'card'
  | 'table-row'
  | 'button'
  | 'image'

interface SkeletonLoaderProps {
  type: SkeletonType
  rows?: number
  width?: string
  height?: string
  className?: string
  circle?: boolean
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  rows = 1,
  width,
  height,
  className = '',
  circle = false,
}) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded'

  const getStyle = () => {
    const style: React.CSSProperties = {}
    if (width) style.width = width
    if (height) style.height = height
    if (circle) style.borderRadius = '9999px'

    return style
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
              <div
                key={index}
                className={`${baseClass} h-4 ${
                  index === rows - 1 && rows > 1 ? 'w-3/4' : 'w-full'
                } ${className}`}
                style={getStyle()}
              ></div>
            ))}
          </div>
        )

      case 'avatar':
        return (
          <div
            className={`${baseClass} ${className}`}
            style={{
              ...getStyle(),
              borderRadius: '9999px',
              width: width || '40px',
              height: height || '40px',
            }}
          ></div>
        )

      case 'card':
        return (
          <div className={`${baseClass} ${className}`} style={getStyle()}>
            <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-t"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        )

      case 'table-row':
        return (
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <div className={`${baseClass} h-4 w-1/4`}></div>
                <div className={`${baseClass} h-4 w-1/4`}></div>
                <div className={`${baseClass} h-4 w-1/4`}></div>
                <div className={`${baseClass} h-4 w-1/4`}></div>
              </div>
            ))}
          </div>
        )

      case 'button':
        return (
          <div
            className={`${baseClass} ${className}`}
            style={{
              ...getStyle(),
              width: width || '100px',
              height: height || '38px',
            }}
          ></div>
        )

      case 'image':
        return (
          <div
            className={`${baseClass} ${className}`}
            style={{
              ...getStyle(),
              width: width || '100%',
              height: height || '200px',
            }}
          ></div>
        )

      default:
        return (
          <div className={`${baseClass} ${className}`} style={getStyle()}></div>
        )
    }
  }

  return <>{renderSkeleton()}</>
}

export default SkeletonLoader
