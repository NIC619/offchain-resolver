import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const signers = await ethers.getSigners()
    const owner = signers[0].address

    await deploy("ENSRegistry", {
        from: owner,
        args: [],
        log: true,
    })
}

export default func
func.tags = ["test"]