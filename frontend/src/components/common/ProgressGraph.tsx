// components/ProgressChart.tsx
"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  ComposedChart
} from "recharts"

const data = [
  { name: "1 Day", value: 30 },
  { name: "7 Days", value: 60 },
  { name: "20 Days", value: 100 }
]

export default function ProgressGraph() {
  return (
    <div className="w-full h-96 p-4 bg-black rounded-lg">
      <h2 className="text-center text-white text-2xl font-semibold mb-4">
        Progress over time
      </h2>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="transparent" />
          <XAxis dataKey="name" tick={{ fill: "white" }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ backgroundColor: "#333", borderColor: "#666" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#0f0" }}
          />
          <Bar
            dataKey="value"
            barSize={50}
            fill="#00ff66"
            radius={[6, 6, 0, 0]}
            animationDuration={1200}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            dot={{ stroke: "#fff", strokeWidth: 2, r: 5, fill: "#fff" }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
