import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import type { EventFragment } from '@ethersproject/abi'
import { DaoWrapped__factory } from '@collective-governance/hardhat'
import { resultToObject } from '@collective-governance/api-evm'
import JsonAlertBox from './JsonAlertBox'

const iface = DaoWrapped__factory.createInterface()
type EventNames = keyof (typeof iface)['events']

interface ReceiptBoxProps {
  receipt: TransactionReceipt
  eventFragment?: EventFragment
  eventName?: EventNames
  onClickExit?: () => void
}

const ReceiptBox: React.FC<ReceiptBoxProps> = ({ receipt, eventFragment, eventName, onClickExit }) => {
  const parseEvent = (receipt: TransactionReceipt) => {
    const fragment = eventFragment || iface.getEvent((eventName || 'Approval') as any)
    let result = {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      events: [] as Record<string, any>[]
    }
    for (const log of receipt.logs) {
      const decodedLog = iface.decodeEventLog(fragment, log.data, log.topics)
      const eventName = fragment.format()
      const params = resultToObject(decodedLog)
      result.events.push({ eventName, ...params })
    }

    return result
  }

  return <JsonAlertBox title={receipt.transactionHash} data={parseEvent(receipt)} onClickExit={onClickExit} />
}

export default ReceiptBox
