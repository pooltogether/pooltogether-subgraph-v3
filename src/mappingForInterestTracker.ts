import {
  InterestTracker,
  Player,
} from '../generated/schema'
import {
  CollateralSupplied,
  CollateralRedeemed,
} from '../generated/templates/InterestTracker/InterestTracker'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'

export function handleCollateralSupplied(event: CollateralSupplied): void {
  const interestTracker = InterestTracker.load(event.address.toHex())
  const player = loadOrCreatePlayer(interestTracker.prizePool, event.params.user.toString())

  player.address = event.params.user
  player.prizePool
  player.balance = player.balance.plus(event.params.collateral)
  // player.shares = player.shares.plus(event.params.shares)

  player.save()
}

export function handleCollateralRedeemed(event: CollateralRedeemed): void {
  const interestTracker = InterestTracker.load(event.address.toHex())
  const player = loadOrCreatePlayer(interestTracker.prizePool, event.params.user.toString())

  player.balance = player.balance.minus(event.params.collateral)
  // player.shares = player.shares.minus(event.params.shares)

  player.save()
}
