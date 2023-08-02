import { parseErrorRegex } from '@kodex-react/ctx-ethers'
import { Contract } from '@ethersproject/contracts'
import useApplication from './useApplication'

export default function useErrorHandler() {
  const { navigate, snackbar: { enqueueSnackbar }, ethers, context } = useApplication()
  const skipError = ['NO_NEW_LOGS_']

  async function handleError<C extends Contract>(error: any, contract?: C) {
    const regexParsed = parseErrorRegex(error.message)
    let transactionHash: string | undefined
    let reason: string | undefined = error['reason']
    let revertReason: string | undefined

    if (typeof regexParsed.txJson === 'string') {
      const txObj = JSON.parse(regexParsed.txJson)
      transactionHash = txObj['hash'] || txObj['transactionHash']
      console.debug(`errorHandler: matchTxJSONFromEthersError`, { transactionHash, txObj, error })
    }

    if (contract && error.data?.data)
      try {
        const revertData = error.data.data
        const decodedError = contract.interface.parseError(revertData)
        console.log(`Transaction failed: ${decodedError.name}`)

        context.dispatch({ type: 'add-error', payload: error })
        enqueueSnackbar(decodedError.name, { variant: 'error' })
        return
      } catch (e) {}

    if (transactionHash && transactionHash.isKeccakHash())
      try {
        revertReason = await ethers.getRevertReason(transactionHash)
        if (revertReason) {
          console.log(`tx error: RevertReason parsed`, { transactionHash, revertReason })
          error['revertReason'] = revertReason
          context.dispatch({ type: 'add-error', payload: error })
          enqueueSnackbar(revertReason || error.message, { variant: 'error' })
          return
        }
      } catch (e) {}

    if (error instanceof Error) {
      const m = error.message.toLowerCase()

      for (const s of skipError) {
        if (m.includes(s.toLowerCase())) {
          return
        }
      }

      if (error.message === 'GOVERNANCE_PROPOSALS_EMPTY') {
        context.dispatch({ type: 'set-is-loading', payload: false })
        context.dispatch({ type: 'set-proposals', payload: {} })
        navigate(`/setup`)

        enqueueSnackbar('governance contract has no proposals (GOVERNANCE_PROPOSALS_EMPTY)', { variant: 'warning' })
        return
      }

      context.dispatch({ type: 'add-error', payload: error })
      enqueueSnackbar(reason || error.message, { variant: 'error' })
    }
  }

  return { handleError, getRevertReason: ethers.getRevertReason }
}
