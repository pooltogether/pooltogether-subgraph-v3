import { Address, BigInt } from "@graphprotocol/graph-ts"
// import {
//   PrizePool as PrizePoolContract,
// } from '../../generated/PrizePoolBuilder/PrizePool'
import {
  PrizePool,
} from '../../generated/schema'

import { createPeriodicPrizePool } from '../helpers/createPeriodicPrizePool'
import { createSponsorship } from '../helpers/createSponsorship'
import { createTicket } from '../helpers/createTicket'

export function loadOrCreatePrizePool(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
): PrizePool {
  let prizePool = PrizePool.load(prizePool.toHex())

  if (!prizePool) {
    prizePool = new PrizePool(prizePool.toHex())
    const boundPrizePool = CompoundPeriodicPrizePoolContract.bind(prizePool)

    prizePool.prizePoolBuilder = builder.toHex()
    prizePool.creator = creator
    prizePool.prizeStrategy = prizeStrategy

    createPeriodicPrizePool(
      prizePool,
      boundPrizePool.prizePool()
    )

    createSponsorship(
      prizePool,
      boundPrizePool.sponsorship()
    )

    createTicket(
      prizePool,
      boundPrizePool.ticket()
    )

    prizePool.save()
  }

  return prizePool as PrizePool
}
