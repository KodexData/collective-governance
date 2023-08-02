import { PieChart, Pie, Cell } from 'recharts'
const _COLORS = ['#0088FE', '#03C39F', '#FFB827', '#FE8042']
const COLORS = ['#03C39F', '#FFB827', '#FE8042']

const data = [{ value: 30 }, { value: 20 }, { value: 20 }, { value: 15 }]

// Just a simplified color function to minimize the
// example code -- use what works best for you
// https://codesandbox.io/s/pie-chart-with-drop-shadow-fxe8x?file=/src/App.tsx:0-1119
const getColor = (index: number) => COLORS[index % COLORS.length]

const GlowPieChart: React.FC = () => {
  return (
    <div className='App'>
      <PieChart width={400} height={400}>
        <Pie data={data} cx={200} cy={200} innerRadius={140} outerRadius={150} fill='#8884d8' dataKey='value'>
          {data.map((_, index) => {
            const segmentColor = getColor(index)
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
      </PieChart>
    </div>
  )
}

export default GlowPieChart
