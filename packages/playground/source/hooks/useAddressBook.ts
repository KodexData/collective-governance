import type { AddressInformation } from 'types'
import { useMemo } from 'react'
import useApplication from './useApplication'
import AddressStorage from 'components/address-book/AddressStorage'

interface AddressBookFilter {}

export default function useAddressBook(addresses?: AddressInformation[]) {
  const {
    ethers,
    context: { state }
  } = useApplication()
  const addrStore = new AddressStorage(state.chainId)

  return useMemo(() => {
    const data: Record<string, AddressInformation> = {}
    const { chainId, address } = ethers.state

    addresses = [...addrStore.data]

    if (address && address.isAddress()) {
      data[address] = {
        hash: address,
        description: 'METAMASK USER ADDRESS',
        type: 'ADDRESS',
        chainId: chainId
      }
    }

    for (const addressInfo of addresses || []) {
      data[addressInfo.hash] = {
        current: false,
        ...addressInfo
      }
    }

    if (state.tokenInfo) {
      for (const { delegator, votes } of state.delegators || []) {
        data[delegator] = {
          current: true,
          hash: delegator,
          type: 'ADDRESS',
          chainId: chainId,
          description: `DELEGATOR AT: ${state.contracts.Governance}`
        }
      }
    }

    if (state.contracts.Governance) {
      data[state.contracts.Governance] = {
        current: true,
        hash: state.contracts.Governance,
        description: 'GOVERNANCE CONTRACT',
        type: 'CONTRACT',
        chainId: chainId
      }
    }

    if (state.contracts.DaoToken) {
      data[state.contracts.DaoToken] = {
        current: true,
        hash: state.contracts.DaoToken,
        description: 'DAO TOKEN CONTRACT',
        type: 'CONTRACT',
        chainId: chainId
      }
    }

    if (state.contracts.TimelockController) {
      data[state.contracts.TimelockController] = {
        current: true,
        hash: state.contracts.TimelockController,
        description: 'TIMELOCK CONTROLLER CONTRACT',
        type: 'CONTRACT',
        chainId: chainId
      }
    }

    if (state.contracts.Treasury) {
      data[state.contracts.Treasury] = {
        current: true,
        hash: state.contracts.Treasury,
        description: 'TREASURY CONTRACT',
        type: 'CONTRACT',
        chainId: chainId
      }
    }

    const results = Object.values(data).sort((a, b) => Number(b.current) - Number(a.current))
    addrStore.add(...results)

    return results
  }, [
    //prettier-ignore
    addresses,
    ethers.state.address,
    state.contracts,
    state.delegators,
    state.tokenInfo,
    ethers.state.chainId
  ])
}
