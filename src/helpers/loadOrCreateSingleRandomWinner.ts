import { Address, log } from '@graphprotocol/graph-ts'

import {
  SingleRandomWinnerPrizeStrategy,
} from '../../generated/schema'

import { loadOrCreatePrizeStrategy } from './loadOrCreatePrizeStrategy'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
} from '../../generated/templates/SingleRandomWinner/SingleRandomWinner'

import { ZERO_ADDRESS } from './common'
import { loadOrCreateControlledToken } from './loadOrCreateControlledToken'

export function loadOrCreateSingleRandomWinner(
  singleRandomWinner: Address,
): SingleRandomWinnerPrizeStrategy {
  const _singleRandomWinnerAddress = singleRandomWinner.toHex()
  let _singleRandomWinner = SingleRandomWinnerPrizeStrategy.load(_singleRandomWinnerAddress)
  if (!_singleRandomWinner) {

    // Create SingleRandomWinnerPrizeStrategy
    _singleRandomWinner = new SingleRandomWinnerPrizeStrategy(_singleRandomWinnerAddress)
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
      _boundSingleRandomWinner.ticket()
    )
    _singleRandomWinner.ticket = ticket.id

    const sponsorship = loadOrCreateControlledToken(
      _boundSingleRandomWinner.sponsorship()
    )  
    _singleRandomWinner.sponsorship = sponsorship.id
    _singleRandomWinner.save()

    let prizeStrategy = loadOrCreatePrizeStrategy(singleRandomWinner)
    prizeStrategy.singleRandomWinner = _singleRandomWinner.id
    prizeStrategy.save()
  }

  return _singleRandomWinner as SingleRandomWinnerPrizeStrategy
}