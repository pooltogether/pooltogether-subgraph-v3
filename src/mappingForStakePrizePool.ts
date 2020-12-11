
import {
  StakePrizePoolInitialized,
} from '../generated/templates/StakePrizePool/StakePrizePool'

import { loadOrCreateStakePrizePool } from './helpers/loadOrCreateStakePrizePool'

export function handleStakePrizePoolInitialized(event: StakePrizePoolInitialized): void {
  const _stakePrizePool = loadOrCreateStakePrizePool(event.address)
  _stakePrizePool.stakeToken = event.params.stakeToken
  _stakePrizePool.save()
}

