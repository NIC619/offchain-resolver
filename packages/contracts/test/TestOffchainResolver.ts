import { expect } from "chai"
import { ethers } from "hardhat"
import { Contract, Signature } from "ethers"
import * as namehash from "eth-ens-namehash"
import {
  defaultAbiCoder,
  SigningKey,
  Interface,
  arrayify,
  hexConcat,
} from "ethers/lib/utils"

const TEST_ADDRESS = "0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe"

describe("OffchainResolver", function () {
  const name = "test.eth"
  let snapshot = ""
  let signingKey: SigningKey, resolver: Contract

  before(async () => {
    signingKey = new SigningKey(ethers.utils.randomBytes(32))
    const signingAddress = ethers.utils.computeAddress(signingKey.privateKey)
    const OffchainResolver = await ethers.getContractFactory("OffchainResolver")
    resolver = await OffchainResolver.deploy("http://localhost:8080/", [
      signingAddress,
    ])
  })

  beforeEach(async () => {
    snapshot = await ethers.provider.send("evm_snapshot", [])
  })

  afterEach(async () => {
    await ethers.provider.send("evm_revert", [snapshot])
  })

  describe("supportsInterface()", async () => {
    it("supports known interfaces", async () => {
      expect(await resolver.supportsInterface("0x9061b923")).to.equal(true) // IExtendedResolver
    })

    it("does not support a random interface", async () => {
      expect(await resolver.supportsInterface("0x3b3b57df")).to.equal(false)
    })
  })

  describe("resolve()", async () => {
    it("returns a CCIP-read error", async () => {
      await expect(resolver.resolve(dnsName(name), "0x")).to.be.revertedWith(
        "OffchainLookup"
      )
    })
  })

  describe("resolveWithProof()", async () => {
    let expires = 0
    let callData = ""
    let resultData = ""
    let sig: Signature, iface: Interface

    before(async () => {
      expires = Math.floor(Date.now() / 1000 + 3600)
      // Encode the nested call to 'addr'
      iface = new ethers.utils.Interface([
        "function addr(bytes32) returns(address)",
      ])
      const addrData = iface.encodeFunctionData("addr", [namehash.hash(name)])

      // Encode the outer call to 'resolve'
      callData = resolver.interface.encodeFunctionData("resolve", [
        dnsName(name),
        addrData,
      ])

      // Encode the result data
      resultData = iface.encodeFunctionResult("addr", [TEST_ADDRESS])

      // Generate a signature hash for the response from the gateway
      const callDataHash = await resolver.makeSignatureHash(
        resolver.address,
        expires,
        callData,
        resultData
      )

      // Sign it
      sig = signingKey.signDigest(callDataHash)
    })

    it("resolves an address given a valid signature", async () => {
      // Generate the response data
      const response = defaultAbiCoder.encode(
        ["bytes", "uint64", "bytes"],
        [resultData, expires, hexConcat([sig.r, sig._vs])]
      )

      // Call the function with the request and response
      const [result] = iface.decodeFunctionResult(
        "addr",
        await resolver.resolveWithProof(response, callData)
      )
      expect(result).to.equal(TEST_ADDRESS)
    })

    it("reverts given an invalid signature", async () => {
      // Corrupt the sig
      const deadsig = arrayify(hexConcat([sig.r, sig._vs])).slice()
      deadsig[0] = deadsig[0] + 1

      // Generate the response data
      const response = defaultAbiCoder.encode(
        ["bytes", "uint64", "bytes"],
        [resultData, expires, deadsig]
      )

      // Call the function with the request and response
      await expect(resolver.resolveWithProof(response, callData)).to.be.reverted
    })

    it("reverts given an expired signature", async () => {
      // Generate the response data
      const response = defaultAbiCoder.encode(
        ["bytes", "uint64", "bytes"],
        [
          resultData,
          Math.floor(Date.now() / 1000 - 1),
          hexConcat([sig.r, sig._vs]),
        ]
      )

      // Call the function with the request and response
      await expect(resolver.resolveWithProof(response, callData)).to.be.reverted
    })
  })
})

function dnsName(name: string): string {
  // strip leading and trailing .
  const n = name.replace(/^\.|\.$/gm, "")

  const bufLen = n === "" ? 1 : n.length + 2
  const buf = Buffer.allocUnsafe(bufLen)

  let offset = 0
  if (n.length) {
    const list = n.split(".")
    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }
  buf[offset++] = 0
  return (
    "0x" +
    buf.reduce(
      (output, elem) => output + ("0" + elem.toString(16)).slice(-2),
      ""
    )
  )
}
