import { log } from '@graphprotocol/graph-ts'
import { PeriodicPrizePool } from '../generated/schema'
import {
  PeriodicPrizePool as PeriodicPrizePoolContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwardCompleted,
} from '../generated/templates/PeriodicPrizePool/PeriodicPrizePool'

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  const periodicPrizePool = new PeriodicPrizePool(event.address.toHexString())

  

  periodicPrizePool.save()
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
}

export function handlePrizePoolAwardCompleted(event: PrizePoolAwardCompleted): void {

}
