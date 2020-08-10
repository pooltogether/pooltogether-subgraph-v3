import { BigInt } from "@graphprotocol/graph-ts"
import {
  Player
} from '../../generated/schema'

const ZERO = BigInt.fromI32(0)

export function hasZeroTickets(player: Player): boolean {
  // return player.consolidatedBalance.plus(player.latestBalance).equals(ZERO)
  return player.balance.equals(ZERO)
}