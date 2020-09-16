import { Address, Bytes, BigInt, log } from '@graphprotocol/graph-ts'

import {
  PrizePool,
  PrizeStrategy,
  SingleRandomWinner,
} from '../../generated/schema'

import {
  SingleRandomWinner as SingleRandomWinnerTemplate,
} from '../../generated/templates'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
} from '../../generated/templates/SingleRandomWinner/SingleRandomWinner'

import { ZERO_ADDRESS } from './common'


export function loadOrCreateSingleRandomWinner(
  singleRandomWinner: Address,
): SingleRandomWinner {
  const _singleRandomWinnerAddress = singleRandomWinner.toHex()
  let _singleRandomWinner = SingleRandomWinner.load(_singleRandomWinnerAddress)

  if (!_singleRandomWinner) {
    // Create SingleRandomWinner
    _singleRandomWinner = new SingleRandomWinner(_singleRandomWinnerAddress)
    const boundSingleRandomWinner = SingleRandomWinnerContract.bind(singleRandomWinner)

    // Update PrizeStrategy Link
    let _prizeStrategy = PrizeStrategy.load(_singleRandomWinnerAddress)
    _prizeStrategy.singleRandomWinner = _singleRandomWinner.id
    _prizeStrategy.save()

    const _prizePoolAddress = _prizeStrategy.prizePool
    const _prizePool = PrizePool.load(_prizePoolAddress)


    _singleRandomWinner.owner = _prizePool.owner
    _singleRandomWinner.prizePool = _prizePool.id
    _singleRandomWinner.rng = boundSingleRandomWinner.rng()
    _singleRandomWinner.ticket = ZERO_ADDRESS // boundPrizeStrategy.ticket()
    _singleRandomWinner.sponsorship = ZERO_ADDRESS // boundPrizeStrategy.sponsorship()

    _singleRandomWinner.prizePeriodSeconds = boundSingleRandomWinner.prizePeriodSeconds()
    _singleRandomWinner.prizePeriodStartedAt = boundSingleRandomWinner.prizePeriodStartedAt()
    _singleRandomWinner.prizePeriodEndAt = _singleRandomWinner.prizePeriodStartedAt.plus(_singleRandomWinner.prizePeriodSeconds)

    _singleRandomWinner.save()

    // Start listening for events from the dynamically generated contract
    SingleRandomWinnerTemplate.create(singleRandomWinner)

  }

  return _singleRandomWinner as SingleRandomWinner
}
