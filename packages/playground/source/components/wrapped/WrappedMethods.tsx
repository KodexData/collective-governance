import type { DaoWrapped, TknInfo } from '@collective-governance/api-evm/types'
import { CtxWrapped, WrappedTokenState } from './context'
import { DaoWrapped__factory } from '@collective-governance/hardhat'
import { useEffect, useState } from 'react'
import { useApplication } from 'hooks'
import SxCardHead from 'components/customs/SxCardHead'
import DepositForBox from './DepositForBox'
import WithdrawToBox from './WithdrawToBox'
import SxCard from 'components/customs/SxCard'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

interface WrappedTokenInfo {
  info: TknInfo
  permit?: boolean
}

const WrappedMethods: React.FC<WrappedTokenInfo> = ({ info, permit }) => {
  const [contract, setContract] = useState<DaoWrapped>()
  const [info1, setInfo1] = useState<TknInfo>(info)
  const [info2, setInfo2] = useState<TknInfo>()
  const [balance1, setBalance1] = useState<string>()
  const [balance2, setBalance2] = useState<string>()
  const { governance, ethers } = useApplication()

  async function getData() {
    if (!ethers.provider || !ethers.state.address) return
    const { address, underlying } = info1

    if (address && underlying) {
      const signer = ethers.provider.getSigner()
      const tkn1 = DaoWrapped__factory.connect(address, signer)
      const tkn2 = DaoWrapped__factory.connect(underlying, signer)
      const nfo1 = await governance.getTknInfo(tkn1)
      const nfo2 = await governance.getTknInfo(tkn2)
      const bal1 = await tkn1.balanceOf(ethers.state.address)
      const bal2 = await tkn2.balanceOf(ethers.state.address)

      //prettier-ignore
      const res: Partial<WrappedTokenState> = {
        balance1: bal1.toString(),
        balance2: bal2.toString(),
        info1: nfo1, info2: nfo2,
      }

      setInfo1(res.info1!)
      setInfo2(res.info2)
      setBalance1(res.balance1)
      setBalance2(res.balance2)

      return res
    }
  }

  useEffect(() => {
    if (!ethers.state.chainId || !info1.address) return
    const c = DaoWrapped__factory.connect(info1.address, ethers.provider!.getSigner())
    setContract(c)
  }, [info1.address, ethers.state.chainId])

  useEffect(() => {
    if (!contract || !ethers.state.address) return
    getData()
  }, [contract, ethers.state.address])

  return (
    <CtxWrapped.Provider value={{ balance1, balance2, info1, info2, getData, contract }}>
      <SxCard sx={{ textAlign: 'left', mb: 2 }}>
        <SxCardHead title='EXECUTE DAO WRAPPER' />
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
            <DepositForBox permit={permit} />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
            <WithdrawToBox />
          </Grid>
        </Grid>
      </SxCard>
    </CtxWrapped.Provider>
  )
}

export default WrappedMethods
