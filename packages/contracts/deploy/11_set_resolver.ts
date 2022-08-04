import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const signers = await hre.ethers.getSigners()
    const owner = signers[0].address
    const registry = await hre.ethers.getContractAt("ENSRegistry", (await (hre.deployments.get("ENSRegistry"))).address)
    const resolver = await hre.ethers.getContractAt("OffchainResolver", (await (hre.deployments.get("OffchainResolver"))).address)
    await registry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", ethers.utils.id("eth"), owner, {from: owner})
    await registry.setSubnodeOwner(ethers.utils.namehash("eth"), ethers.utils.id("test"), owner, {from: owner})
    await registry.setResolver(ethers.utils.namehash("test.eth"), resolver.address, {from: owner})
}

export default func
func.tags = ["test", "demo"]