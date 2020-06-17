import { Address } from '@graphprotocol/graph-ts'
import {
  YieldService,
} from '../generated/schema'
import {
  PrincipalSupplied,
  PrincipalRedeemed,
  PrincipalCaptured,
} from '../generated/templates/YieldService/CompoundYieldService'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'

export function handlePrincipalSupplied(event: PrincipalSupplied): void {
  const yieldService = YieldService.load(event.address.toHex())
  
  // const player = loadOrCreatePlayer(
  //   Address.fromString(yieldService.prizePool),
  //   event.params.from
  // )

  // player.address = event.params.from
  // player.prizePool = yieldService.prizePool
  // player.balance = player.balance.plus(event.params.amount)
  // // player.shares = player.shares.plus(event.params.shares)

  // player.save()
}

export function handlePrincipalRedeemed(event: PrincipalRedeemed): void {
  // const yieldService = YieldService.load(event.address.toHex())
}

export function handlePrincipalCaptured(event: PrincipalCaptured): void {
  // const yieldService = YieldService.load(event.address.toHex())
}
