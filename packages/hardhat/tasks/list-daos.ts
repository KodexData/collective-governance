import { task } from 'hardhat/config'

task('list-daos', 'Lists all registered DAOs from DaoRegistry contract')
  .addOptionalParam('address', 'contract address to DaoRegistry main contract')
  .setAction(async ({ address }, { ethers }) => {
    if (!address || !address.isAddress()) throw new Error(`invalid contract address: ${address}`)
    const contract = await ethers.getContractAt('DaoRegistry', address)
    const activeDAOs = contract.totalDAOs()

    // in future scan logs and shit.. but first finish contracts to avoid deprecation bullshit
    console.log(`activeDAOs: ${activeDAOs}`)
  })
