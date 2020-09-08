import { Address, log } from '@graphprotocol/graph-ts'
import {
  Transfer,
  Transfer__Params
} from '../generated/templates/Ticket/ControlledToken'
import {
  PrizeStrategy,
  PrizePool,
  Ticket,
} from '../generated/schema'

import {
  decrementPlayerCount,
  incrementPlayerCount,
  decrementPlayerBalance,
  incrementPlayerBalance,
} from './helpers/prizePoolHelpers'
import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function determineTransferType(params: Transfer__Params): string {
  let transferType = "Mint"
  
  if (
    params.from.toHex() != ZERO_ADDRESS &&
    params.to.toHex() != ZERO_ADDRESS
  ) {
    transferType = "PlayerToPlayer"
  } else if (params.to.toHex() == ZERO_ADDRESS) {
    transferType = "Burn"
  }

  return transferType
}

export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params)
  
  // Currently only handling player to player and burn transfers here
  // as Depositing handles 'Minted'
  if (transferType == "PlayerToPlayer") {
    // log.warning('in Ticket#handleTransfer for PlayerToPlayer send', [])
    const _ticket = Ticket.load(event.address.toHex())
    const _prizeStrategy = PrizeStrategy.load(_ticket.prizeStrategy)
    const _prizePool = PrizePool.load(_prizeStrategy.prizePool)

    const _sendingPlayer = loadOrCreatePlayer(
      Address.fromString(_prizePool.id),
      event.params.from
    )
    decrementPlayerBalance(_sendingPlayer, event.params.value)

    _sendingPlayer.save()


    const _receivingPlayer = loadOrCreatePlayer(
      Address.fromString(_prizePool.id),
      event.params.to
    )

    const receivingPlayersCachedBalance = _receivingPlayer.balance
    incrementPlayerBalance(_receivingPlayer, event.params.value)
    // check what shares are, if still a thing?
    // _receivingPlayer.shares = _receivingPlayer.shares.plus(event.params.shares)

    _receivingPlayer.save()


    decrementPlayerCount(_prizePool as PrizePool, _sendingPlayer)
    incrementPlayerCount(_prizePool as PrizePool, receivingPlayersCachedBalance)

    _prizePool.save()
  } else if (transferType == "Burn") {
    // log.warning('in Ticket#handleTransfer for Burn', [])

    // const _ticket = Ticket.load(event.address.toHex())
    // const _prizeStrategy = PrizeStrategy.load(_ticket.prizeStrategy)
    // const _prizePool = PrizePool.load(_prizeStrategy.prizePool)

    // const _sendingPlayer = loadOrCreatePlayer(
    //   Address.fromString(_prizePool.id),
    //   event.params.from
    // )
    // decrementPlayerBalance(_sendingPlayer, event.params.value)
    // _sendingPlayer.save()

    // decrementPlayerCount(_prizePool as PrizePool, _sendingPlayer)

    // _prizePool.save()
  }

}
