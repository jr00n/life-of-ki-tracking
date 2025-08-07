'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendPoint {
  date: string
  value: number
  label?: string
}

interface TrendChartProps {
  title: string
  data: TrendPoint[]
  color?: string
  maxValue?: number
  unit?: string
}

export function TrendChart({ title, data, color = 'rgb(59, 130, 246)', maxValue = 5, unit = '' }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Geen data beschikbaar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const width = 300
  const height = 120
  const padding = 20

  // Calculate dimensions
  const chartWidth = width - (padding * 2)
  const chartHeight = height - (padding * 2)

  // Find min/max values
  const minValue = 0
  const values = data.map(d => d.value)
  const actualMax = Math.max(...values)
  const actualMin = Math.min(...values)

  // Create points for the line
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + (1 - (point.value - minValue) / (maxValue - minValue)) * chartHeight
    return { x, y, ...point }
  })

  // Create path string for the line
  const pathString = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '').trim()

  // Create area fill path
  const areaPath = `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  // Determine trend
  const firstValue = values[0]
  const lastValue = values[values.length - 1]
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable'
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color }}>
              {lastValue.toFixed(1)}{unit}
            </p>
            <p className={`text-sm ${trendColor}`}>
              {trend === 'up' ? '↗️ Stijgend' : trend === 'down' ? '↘️ Dalend' : '→ Stabiel'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg width={width} height={height} className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id={`grid-${title}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
              </linearGradient>
            </defs>

            {/* Background grid */}
            <rect width={width} height={height} fill={`url(#grid-${title})`} />

            {/* Area fill */}
            <path
              d={areaPath}
              fill={`url(#gradient-${title})`}
              stroke="none"
            />

            {/* Line */}
            <path
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Y-axis labels */}
            <text x={padding - 5} y={padding + 5} fill="currentColor" fontSize="10" textAnchor="end" opacity="0.6">
              {maxValue}
            </text>
            <text x={padding - 5} y={height - padding + 5} fill="currentColor" fontSize="10" textAnchor="end" opacity="0.6">
              {minValue}
            </text>
          </svg>
        </div>
        
        {/* Summary stats */}
        <div className="flex justify-between mt-4 text-sm text-muted-foreground">
          <div>
            <p>Min: {actualMin.toFixed(1)}{unit}</p>
          </div>
          <div>
            <p>Gem: {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}{unit}</p>
          </div>
          <div>
            <p>Max: {actualMax.toFixed(1)}{unit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}