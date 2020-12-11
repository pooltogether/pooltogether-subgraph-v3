import { log, Address } from '@graphprotocol/graph-ts'

import {
  StakePrizePool,
} from '../../generated/schema'

import {
  StakePrizePool as StakePrizePoolContract,
} from '../../generated/templates/StakePrizePool/StakePrizePool'

import { loadOrCreatePrizePool } from './loadOrCreatePrizePool'


export function loadOrCreateStakePrizePool(
  prizePool: Address
): StakePrizePool {
  let _stakePrizePool = StakePrizePool.load(prizePool.toHex())
  if (!_stakePrizePool) {
    _stakePrizePool = new StakePrizePool(prizePool.toHex())

    const _prizePool = loadOrCreatePrizePool(prizePool)
    _prizePool.prizePoolType = 'Stake'

    _prizePool.stakePrizePool = _stakePrizePool.id
    
    _prizePool.save()

    const _boundskatePrizePool = StakePrizePoolContract.bind(prizePool)
    const tryTokenCall = _boundskatePrizePool.try_token()
    if(tryTokenCall.reverted){
        log.warning("try_token call reverted for {}", [prizePool.toHexString()])
        _stakePrizePool.stakeToken = null
    }
    else{
        _stakePrizePool.stakeToken = tryTokenCall.value
    }
    _stakePrizePool.save()

  }

  return _stakePrizePool as StakePrizePool
}
