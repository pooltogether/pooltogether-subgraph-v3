import { log, Address } from '@graphprotocol/graph-ts'

import {
  YieldSourcePrizePool,
} from '../../generated/schema'

import {
  YieldSourcePrizePool as YieldSourcePrizePoolContract
} from '../../generated/templates/YieldSourcePrizePool/YieldSourcePrizePool'

import { loadOrCreatePrizePool } from './loadOrCreatePrizePool'


export function loadOrCreateYieldSourcePrizePool(
  prizePool: Address
): YieldSourcePrizePool {
  let _yieldSourcePrizePool = YieldSourcePrizePool.load(prizePool.toHex())
  if (!_yieldSourcePrizePool) {
    _yieldSourcePrizePool = new YieldSourcePrizePool(prizePool.toHex())

    const _prizePool = loadOrCreatePrizePool(prizePool)
    _prizePool.prizePoolType = 'YieldSource'
    _prizePool.yieldSourcePrizePool = _yieldSourcePrizePool.id
    _prizePool.save()


    const _boundYieldSourcePrizePool = YieldSourcePrizePoolContract.bind(prizePool)
    _yieldSourcePrizePool.yieldSource = _boundYieldSourcePrizePool.yieldSource()
    _yieldSourcePrizePool.save()

  }

  return _yieldSourcePrizePool as YieldSourcePrizePool
}
