import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  PoolContract
} from '../../generated/schema'

const ZERO = BigInt.fromI32(0)

export function loadOrCreatePoolContract(poolAddress: Address, save: boolean = true): PoolContract {
  const poolId = poolAddress.toHex()
  let poolContract = PoolContract.load(poolId)
  if (!poolContract) {
    poolContract = new PoolContract(poolId)
    poolContract.drawsCount = ZERO
    poolContract.openDrawId = ZERO
    poolContract.committedDrawId = ZERO
    poolContract.committedBalance = ZERO
    poolContract.openBalance = ZERO
    poolContract.sponsorshipAndFeeBalance = ZERO
    poolContract.paused = false
    poolContract.version = ZERO
    if (save) {
      poolContract.save()
    }
  }
  return poolContract as PoolContract
}
