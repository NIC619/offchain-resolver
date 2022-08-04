import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { deployer, signer } = await hre.getNamedAccounts()
    if(!hre.network.config["gatewayurl"]){
        throw("gatewayurl is missing on hardhat.config.js")
    }

    await deploy("OffchainResolver", {
        from: deployer,
        args: [hre.network.config["gatewayurl"], [signer]],
        log: true,
    })
}

export default func
func.tags = ["test", "demo"]