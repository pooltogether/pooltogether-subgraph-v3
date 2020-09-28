import { Address } from '@graphprotocol/graph-ts'

import {
  SingleRandomWinner,
} from '../../generated/schema'

import {
  SingleRandomWinner as SingleRandomWinnerTemplate,
} from '../../generated/templates'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
} from '../../generated/templates/SingleRandomWinner/SingleRandomWinner'

import { loadOrCreatePrizePool } from './loadOrCreatePrizePool'
import { loadOrCreatePrizeStrategy } from './loadOrCreatePrizeStrategy'

import { ZERO_ADDRESS } from './common'


export function loadOrCreateSingleRandomWinner(
  singleRandomWinner: Address,
): SingleRandomWinner {
  const _singleRandomWinnerAddress = singleRandomWinner.toHex()
  let _singleRandomWinner = SingleRandomWinner.load(_singleRandomWinnerAddress)

  if (!_singleRandomWinner) {
    // Create SingleRandomWinner
    _singleRandomWinner = new SingleRandomWinner(_singleRandomWinnerAddress)
    const _boundSingleRandomWinner = SingleRandomWinnerContract.bind(singleRandomWinner)

    // Get Prize Pool
    const _prizePoolAddress = _boundSingleRandomWinner.prizePool()
    const _prizePool = loadOrCreatePrizePool(_prizePoolAddress, singleRandomWinner)

    // Update PrizeStrategy Link
    const _prizeStrategy = loadOrCreatePrizeStrategy(_prizePoolAddress, singleRandomWinner)
    _prizeStrategy.singleRandomWinner = _singleRandomWinner.id
    _prizeStrategy.save()

    _singleRandomWinner.owner = _prizePool.owner
    _singleRandomWinner.prizePool = _prizePool.id
    _singleRandomWinner.rng = _boundSingleRandomWinner.rng()
    _singleRandomWinner.ticket = ZERO_ADDRESS
    _singleRandomWinner.sponsorship = ZERO_ADDRESS

    _singleRandomWinner.prizePeriodSeconds = _boundSingleRandomWinner.prizePeriodSeconds()
    _singleRandomWinner.prizePeriodStartedAt = _boundSingleRandomWinner.prizePeriodStartedAt()
    _singleRandomWinner.prizePeriodEndAt = _singleRandomWinner.prizePeriodStartedAt.plus(_singleRandomWinner.prizePeriodSeconds)

    _singleRandomWinner.save()

    // Start listening for events from the dynamically generated contract
    SingleRandomWinnerTemplate.create(singleRandomWinner)
  }

  return _singleRandomWinner as SingleRandomWinner
}
