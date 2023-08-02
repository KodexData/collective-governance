import 'assets/css/charts.css'

export type ChartItem = { name: string; value: number }
export const COLORS = ['#00C49F', '#FF8042', '#FFBB28']
export const RADIAN = Math.PI / 180
export const getColor = (index: number) => COLORS[index % COLORS.length]

export const renderCustomizedLabel: React.FC<any> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}
