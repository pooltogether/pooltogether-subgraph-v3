import { Address, log } from '@graphprotocol/graph-ts'
import {
  Transfer,
} from '../generated/templates/Ticket/ControlledToken'
import {
  SingleRandomWinner,
  PrizePool,
  Ticket,
} from '../generated/schema'

import {
  decrementPlayerCount,
  incrementPlayerCount,
  decrementPlayerBalance,
  incrementPlayerBalance,
} from './helpers/prizePoolHelpers'
import {
  determineTransferType
} from './helpers/controlledTokenHelpers'
import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'


export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params)

  // Currently only handling player to player transfers here
  // as Depositing handles 'Minted' and withdraw 'Burned'
  if (transferType == "UserToUser") {
    // log.warning('in Ticket#handleTransfer for UserToUser send', [])
    const _ticket = Ticket.load(event.address.toHex())
    const _prizeStrategy = SingleRandomWinner.load(_ticket.prizeStrategy.toHex())
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
  }

}
