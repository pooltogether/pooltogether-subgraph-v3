import { BigInt, Address, store } from "@graphprotocol/graph-ts"
import {
  MCDAwarePool
} from "../generated/PoolSai/MCDAwarePool"
import {
  PoolToken,
  Approval,
  AuthorizedOperator,
  Burned,
  Minted,
  Redeemed,
  RevokedOperator,
  Sent,
  Transfer
} from "../generated/PoolToken"
import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { consolidateBalance } from './helpers/consolidateBalance'
import { loadOrCreatePoolTokenContract } from './helpers/loadOrCreatePoolTokenContract'
import { hasZeroTickets } from './helpers/hasZeroTickets'
import { loadOrCreatePoolContract } from "./helpers/loadOrCreatePoolContract"
import { depositCommitted } from "./helpers/depositCommitted"

const ONE = BigInt.fromI32(1)

function withdraw(playerAddress: Address, poolAddress: Address, amount: BigInt): void { 
  let player = loadOrCreatePlayer(playerAddress, poolAddress)
  consolidateBalance(player)

  let pool = loadOrCreatePoolContract(poolAddress)
  let poolContract = MCDAwarePool.bind(poolAddress)
  pool.committedBalance = poolContract.committedSupply()
  pool.version = pool.version.plus(ONE)
  pool.save()

  player.consolidatedBalance = player.consolidatedBalance.minus(amount)

  if (hasZeroTickets(player)) {
    store.remove('Player', player.id)
  } else {
    player.version = player.version.plus(ONE)
    player.save()
  }
}

export function handleApproval(event: Approval): void {
}

export function handleAuthorizedOperator(event: AuthorizedOperator): void {}

export function handleBurned(event: Burned): void {}

export function handleMinted(event: Minted): void {}

export function handleRedeemed(event: Redeemed): void {}

export function handleRevokedOperator(event: RevokedOperator): void {}

export function handleSent(event: Sent): void {
  loadOrCreatePoolTokenContract(event.address)
  let poolToken = PoolToken.bind(event.address)
  let poolAddress = poolToken.pool()
  withdraw(event.params.from, poolAddress, event.params.amount)
  depositCommitted(event.params.to, poolAddress, event.params.amount)
}

// only need to track either Sent or Transfer events.  Sent is handled above
export function handleTransfer(event: Transfer): void {}
