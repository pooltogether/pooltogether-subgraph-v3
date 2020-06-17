import { Address } from '@graphprotocol/graph-ts'
import {
  Timelock,
} from '../generated/schema'
import {
  CollateralTimelocked,
  CollateralSwept,
} from '../generated/templates/Timelock/Timelock'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'

export function handleCollateralTimelocked(event: CollateralTimelocked): void {
  const timelock = Timelock.load(event.address.toHex())
  const player = loadOrCreatePlayer(
    Address.fromString(timelock.prizePool),
    event.params.to
  )

  // This may need to be an association of many timelocked balances per player
  player.timelockedBalance = player.timelockedBalance.plus(event.params.amount)
  player.unlockTimestamp = event.params.unlockTimestamp

  player.save()
}

export function handleCollateralSwept(event: CollateralSwept): void {
  const timelock = Timelock.load(event.address.toHex())
  const player = loadOrCreatePlayer(
    Address.fromString(timelock.prizePool),
    event.params.to
  )

  player.timelockedBalance = player.timelockedBalance.minus(event.params.amount)
  // player.unlockTimestamp = event.params.unlockTimestamp ?

  player.save()
}
