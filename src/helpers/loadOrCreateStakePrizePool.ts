import { log, Address } from '@graphprotocol/graph-ts'

import {
  StakePrizePool,
} from '../../generated/schema'
import { ONE, ZERO } from './common'

import { loadOrCreatePrizePool } from './loadOrCreatePrizePool'


export function loadOrCreateStakePrizePool(
  prizePool: Address
): StakePrizePool {
  let _stakePrizePool = StakePrizePool.load(prizePool.toHex())
  if (!_stakePrizePool) {
    log.warning("debug7623 creating stakeprizepool {} ",[prizePool.toHexString()])
    _stakePrizePool = new StakePrizePool(prizePool.toHex())

    const _prizePool = loadOrCreatePrizePool(prizePool)
    _prizePool.prizePoolType = 'Stake'

    _prizePool.stakePrizePool = _stakePrizePool.id
    _prizePool.currentPrizeId = ONE
    _prizePool.save()
    _stakePrizePool.save()

  }

  return _stakePrizePool as StakePrizePool
}
