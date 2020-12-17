
import { log } from '@graphprotocol/graph-ts'
import {
  StakePrizePoolInitialized,
} from '../generated/templates/StakePrizePool/StakePrizePool'

import { loadOrCreateStakePrizePool } from './helpers/loadOrCreateStakePrizePool'

export function handleStakePrizePoolInitialized(event: StakePrizePoolInitialized): void {
  log.warning("initializing stake pool for {} ", [event.address.toHex()])
  const _stakePrizePool = loadOrCreateStakePrizePool(event.address)
  _stakePrizePool.stakeToken = event.params.stakeToken
  _stakePrizePool.save()
}

