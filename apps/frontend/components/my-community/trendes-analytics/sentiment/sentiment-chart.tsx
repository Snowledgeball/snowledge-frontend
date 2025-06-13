'use client'

import { PieChart, Pie, Cell } from 'recharts';

// =========
// Function: SentimentGauge
// ------------
// DESCRIPTION: Displays a semi-circular gauge based on sentiment score.
// PARAMS:
// - sentiment: 'positive' | 'neutral' | 'negative'
// - score: number (0–100)
// RETURNS: JSX.Element
// =========

type Props = {
sentiment: 'positive' | 'neutral' | 'negative'
score: number
}

const COLORS = {
  positive: '#16a34a', // green
  neutral: '#facc15',  // yellow
  negative: '#dc2626', // red
}

export function SentimentGauge({ sentiment, score }: Props) {
const filled = { name: 'score', value: score }
const remainder = { name: 'empty', value: 100 - score }

const data = [filled, remainder]
const color = COLORS[sentiment]

return (
    <div className="flex flex-col items-center space-y-2">
    <PieChart width={240} height={120}>
        <Pie
        data={data}
        dataKey="value"
        startAngle={180}
        endAngle={0}
        cx={120}
        cy={120}
        innerRadius={60}
        outerRadius={90}
        stroke="none"
        >
        <Cell fill={color} />
          <Cell fill="#e5e7eb" /> {/* Tailwind zinc-200 for remainder */}
        </Pie>
    </PieChart>
    <div className="text-center">
        <div className="text-sm text-muted-foreground uppercase tracking-wide">
        {sentiment}
        </div>
        <div className="text-xl font-bold">{score}%</div>
    </div>
    </div>
)
}