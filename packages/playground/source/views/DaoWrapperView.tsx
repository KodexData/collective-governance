import { useParams } from 'react-router-dom'
import WrappedDeployment from 'components/wrapped/WrappedDeployment'

const DaoWrapperView: React.FC = () => {
  const { wrappedAddress } = useParams<{ wrappedAddress: string }>()
  return (
    <>
      <WrappedDeployment wrappedAddress={wrappedAddress} />
    </>
  )
}

export default DaoWrapperView
