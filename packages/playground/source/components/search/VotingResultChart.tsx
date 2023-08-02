import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useVoteChartData } from 'hooks'
import { BigNumber } from '@ethersproject/bignumber'
import * as C from 'components/voting/chart-helpers'
import Box from '@mui/material/Box'
import { useMemo } from 'react'

interface VotingResultChartProps {
  proposalId: string | BigNumber
  hideLegend?: boolean
  height?: number
  noContainer?: boolean
}
const VotingResultChart: React.FC<VotingResultChartProps> = ({ proposalId, hideLegend, height, noContainer }) => {
  const data = useVoteChartData(proposalId)

  const ChartComponent = useMemo(() => {
    return (
      <PieChart height={height || 250}>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={C.renderCustomizedLabel}
          // outerRadius={95}
          fill='#8884d8'
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} style={{ fontSize: 10 }} fill={C.COLORS[index % C.COLORS.length]} />
          ))}
        </Pie>
        {!hideLegend && <Legend />}
      </PieChart>
    )
  }, [proposalId])

  if (noContainer) return <div>{ChartComponent}</div>
  else
    return (
      <ResponsiveContainer height={height || 250} width={height || 250}>
        {ChartComponent}
      </ResponsiveContainer>
    )
}

export default VotingResultChart
