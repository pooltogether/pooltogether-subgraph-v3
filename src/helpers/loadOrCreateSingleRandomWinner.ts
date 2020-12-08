import { Address, log } from '@graphprotocol/graph-ts'

import {
  SingleRandomWinner,
} from '../../generated/schema'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
} from '../../generated/templates/SingleRandomWinner/SingleRandomWinner'

import { ZERO_ADDRESS } from './common'
import { loadOrCreateControlledToken } from './loadOrCreateControlledToken'

export function loadOrCreateSingleRandomWinner(
  singleRandomWinner: Address,
): SingleRandomWinner {
  const _singleRandomWinnerAddress = singleRandomWinner.toHex()
  let _singleRandomWinner = SingleRandomWinner.load(_singleRandomWinnerAddress)
  if (!_singleRandomWinner) {
    // Create SingleRandomWinner
    _singleRandomWinner = new SingleRandomWinner(_singleRandomWinnerAddress)
    const _boundSingleRandomWinner = SingleRandomWinnerContract.bind(singleRandomWinner)

    _singleRandomWinner.owner = _boundSingleRandomWinner.owner()
    _singleRandomWinner.prizePool = _boundSingleRandomWinner.prizePool().toHex() // _prizePool.id
    _singleRandomWinner.rng = _boundSingleRandomWinner.rng()
    _singleRandomWinner.tokenListener = ZERO_ADDRESS
    _singleRandomWinner.ticket = ZERO_ADDRESS
    _singleRandomWinner.sponsorship = ZERO_ADDRESS

    _singleRandomWinner.prizePeriodSeconds = _boundSingleRandomWinner.prizePeriodSeconds()
    _singleRandomWinner.prizePeriodStartedAt = _boundSingleRandomWinner.prizePeriodStartedAt()
    _singleRandomWinner.prizePeriodEndAt = _singleRandomWinner.prizePeriodStartedAt.plus(_singleRandomWinner.prizePeriodSeconds)

    const ticket = loadOrCreateControlledToken(
      _boundSingleRandomWinner.ticket(),
      Address.fromString(_singleRandomWinner.prizePool)
    )
    _singleRandomWinner.ticket = ticket.id
    log.warning("CREATED ticket controlled token at {} with PrizeStrategyId {}", [ticket.id, _singleRandomWinner.id])

    const sponsorship = loadOrCreateControlledToken(
      _boundSingleRandomWinner.sponsorship(),
      Address.fromString(_singleRandomWinner.prizePool)
    )  
    log.warning("GOT HERE", [])
    _singleRandomWinner.sponsorship = sponsorship.id
    log.warning("CREATED sponsorship controlled token at {} with PrizeStrategyId {}", [sponsorship.id, _singleRandomWinner.id])

    _singleRandomWinner.save()
  }

  return _singleRandomWinner as SingleRandomWinner
}
