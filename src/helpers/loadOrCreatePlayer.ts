import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Player } from '../../generated/schema'

import { playerId } from './idTemplates'

export function loadOrCreatePlayer(prizePoolAddress: string, playerAddress: string): Player {
  const id = playerId(prizePoolAddress, playerAddress)
  let player = Player.load(id)

  if (!player) {
    player = new Player(id)

    player.address = Address.fromString(playerAddress)
    player.balance = BigInt.fromI32(0)

    player.save()
  }

  return player as Player
}
