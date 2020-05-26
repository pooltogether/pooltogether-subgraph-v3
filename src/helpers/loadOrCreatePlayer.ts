import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Player
} from '../../generated/schema'

const ZERO = BigInt.fromI32(0)

function formatPlayerId(playerAddress: Address, poolAddress: Address): string {
  return 'player-' + playerAddress.toHex() + '_pool-' + poolAddress.toHex()
}

export function loadOrCreatePlayer(playerAddress: Address, poolAddress: Address): Player {
  let playerId = formatPlayerId(playerAddress, poolAddress)
  let player = Player.load(playerId)
  if (!player) {
    player = new Player(playerId)
    player.address = playerAddress
    player.consolidatedBalance = ZERO
    player.firstDepositDrawId = ZERO
    player.latestBalance = ZERO
    player.latestDrawId = ZERO
    player.poolContract = poolAddress.toHex()
    player.version = ZERO
  }
  return player as Player
}
