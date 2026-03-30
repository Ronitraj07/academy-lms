"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AttendanceChartProps {
  data?: { date: string; percentage: number }[]
}

export function AttendanceChart({ data = [] }: AttendanceChartProps) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    percentage: Math.round(item.percentage),
    fullDate: item.date,
  }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-sm fill-muted-foreground"
          />
          <YAxis
            domain={[0, 100]}
            className="text-sm fill-muted-foreground"
            label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
            }}
            labelFormatter={(value, payload) => {
              const item = payload?.[0]?.payload
              return item?.fullDate ? new Date(item.fullDate).toLocaleDateString() : value
            }}
            formatter={(value) => {
              if (value === undefined || value === null) return ['0%', 'Attendance']
              return [`${value}%`, 'Attendance']
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            name="Attendance %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
