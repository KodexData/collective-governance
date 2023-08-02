import type { ProposalChartDataItem } from 'hooks/useProposalChartData'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useProposalChartData } from 'hooks'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'

const getPercent = (value: number, total: number) => {
  return toPercent(total > 0 ? value / total : 0, 2)
}

const toPercent = (decimal: number, fixed = 0) => {
  return `${(decimal * 100).toFixed(fixed)}%`
}

const renderTooltipContent = (o: any) => {
  const { payload, label } = o
  const total = payload.reduce((result: any, entry: any) => result + entry.value, 0)

  return (
    <Box>
      <Paper sx={{ p: 2, maxWidth: 300, minWidth: 200, textAlign: 'left' }}>
        <Typography className='total' noWrap>{`${label}`}</Typography>
        <Divider />
        {Number(total).toLocaleString()} Total Votes
        <ul className='list'>
          {payload.map((entry: any, index: any) => (
            <li key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${getPercent(entry.value, total)}`}
            </li>
          ))}
        </ul>
      </Paper>
    </Box>
  )
}

interface ProposalChartProps {
  data: ProposalChartDataItem[]
  disableAxes?: boolean
  height?: number
  width?: number
}

export const ProposalChart: React.FC<ProposalChartProps> = ({ data, height, disableAxes }) => {
  const navigate = useNavigate()
  return (
    <>
      <ResponsiveContainer height={height || 250} className='proposal-chart-container'>
        <AreaChart height={height || 250} data={data} stackOffset='expand' margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis
            dataKey='headline'
            onClick={(e: any) => {
              const { proposalId } = data[Number(e.index)]
              navigate(`/proposal/${proposalId}`)
            }}
            tickFormatter={(_, index) => {
              return String(data[index].blockNumber)
            }}
            hide={disableAxes}
          />
          <YAxis tickFormatter={toPercent} hide={disableAxes} />
          <Tooltip
            content={renderTooltipContent}
            wrapperStyle={{
              outline: 0
            }}
          />
          <Area type='monotone' dataKey='for' stackId='1' stroke='#00C49F' fill='#00C49F' />
          <Area type='monotone' dataKey='against' stackId='1' stroke='#FF8042' fill='#FF8042' />
          <Area type='monotone' dataKey='abstain' stackId='1' stroke='#FFBB28' fill='#FFBB28' />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

const ProposalChartView: React.FC = () => {
  return (
    <Paper
      elevation={0}
      variant='outlined'
      sx={{
        p: 2,
        borderRadius: 5,
        textAlign: 'center',
        background: 'transparent'
      }}
    >
      <ProposalChart data={useProposalChartData()} />
    </Paper>
  )
}

export default ProposalChartView
