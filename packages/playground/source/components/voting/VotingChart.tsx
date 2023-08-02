import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useVoteChartData } from 'hooks'
import { BigNumber } from '@ethersproject/bignumber'
import * as C from './chart-helpers'

const VotingChart: React.FC<{ proposalId: string | BigNumber }> = ({ proposalId }) => {
  const data = useVoteChartData(proposalId)
  return (
    <ResponsiveContainer height={250} className='proposal-chart-container'>
      <PieChart width={200} height={200} className='proposal-pie-chart'>
        <Pie data={data} cx='48%' cy='48%' innerRadius={70} outerRadius={90} fill='#8884d8' dataKey='value'>
          {data.map((_, index) => {
            const segmentColor = C.getColor(index)
            return (
              <Cell
                key={`cell-${index}`}
                fill={segmentColor}
                style={{
                  filter: `drop-shadow(0px 0px 10px ${segmentColor}`
                }}
                stroke='0'
              />
            )
          })}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default VotingChart
