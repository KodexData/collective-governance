import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

export interface IJazzIcon {
  size?: number
  value: string
  style?: React.CSSProperties
}
const JazzIcon: React.FC<IJazzIcon> = ({ size, value, style }) => {
  return <Jazzicon diameter={size || 100} seed={jsNumberForAddress(value)} svgStyles={style} />
}

export default JazzIcon
