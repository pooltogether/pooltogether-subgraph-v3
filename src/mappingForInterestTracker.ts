import { Address } from '@graphprotocol/graph-ts'
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
  const player = loadOrCreatePlayer(
    Address.fromString(interestTracker.prizePool),
    event.params.user
  )

  player.address = event.params.user
  player.prizePool = interestTracker.prizePool
  player.balance = player.balance.plus(event.params.collateral)
  // player.shares = player.shares.plus(event.params.shares)

  player.save()
}

export function handleCollateralRedeemed(event: CollateralRedeemed): void {
  const interestTracker = InterestTracker.load(event.address.toHex())
  const player = loadOrCreatePlayer(
    Address.fromString(interestTracker.prizePool),
    event.params.user
  )

  player.balance = player.balance.minus(event.params.collateral)
  // player.shares = player.shares.minus(event.params.shares)

  player.save()
}
