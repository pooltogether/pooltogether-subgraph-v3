// import { log } from '@graphprotocol/graph-ts'
import {
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwardCompleted,
} from '../generated/templates/PeriodicPrizePool/PeriodicPrizePool'

import { loadPeriodicPrizePool } from './helpers/loadPeriodicPrizePool'

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  const periodicPrizePool = loadPeriodicPrizePool(
    event.address,
  )
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
}

export function handlePrizePoolAwardCompleted(event: PrizePoolAwardCompleted): void {

}
