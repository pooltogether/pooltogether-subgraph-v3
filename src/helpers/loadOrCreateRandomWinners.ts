import { Address } from '@graphprotocol/graph-ts'

import {
  PeriodicPrizeStrategy,
} from '../../generated/schema'


import { MultipleWinners } from '../../generated/templates/PeriodicPrizeStrategy/MultipleWinners'

import {
  PeriodicPrizeStrategy as PeriodicPrizeStrategyTemplate,
} from '../../generated/templates'


import { ZERO_ADDRESS } from './common'



export function loadOrCreateRandomWinners(
  multipleWinners: Address,
): PeriodicPrizeStrategy {
  const _multipleRandomWinnerAddress = multipleWinners.toHex() 
  let _multipleRandomWinners = PeriodicPrizeStrategy.load(_multipleRandomWinnerAddress)

  if (!_multipleRandomWinners) { // if entity doesnt exist create 
    _multipleRandomWinners = new PeriodicPrizeStrategy(_multipleRandomWinnerAddress)
    const _boundSingleRandomWinner = MultipleWinners.bind(multipleWinners) // bind to smart contract

    // set fields by calling smart contract/constants
    _multipleRandomWinners.owner = _boundSingleRandomWinner.owner()
    _multipleRandomWinners.prizePool = _boundSingleRandomWinner.prizePool().toHex() // _prizePool.id
    _multipleRandomWinners.rng = _boundSingleRandomWinner.rng()

    _multipleRandomWinners.numberOfWinners = _boundSingleRandomWinner.numberOfWinners() // this is already set in the contract?

    _multipleRandomWinners.tokenListener = ZERO_ADDRESS
    _multipleRandomWinners.ticket = ZERO_ADDRESS
    _multipleRandomWinners.sponsorship = ZERO_ADDRESS

    _multipleRandomWinners.prizePeriodSeconds = _boundSingleRandomWinner.prizePeriodSeconds()
    _multipleRandomWinners.prizePeriodStartedAt = _boundSingleRandomWinner.prizePeriodStartedAt()
    _multipleRandomWinners.prizePeriodEndAt = _multipleRandomWinners.prizePeriodStartedAt.plus(_multipleRandomWinners.prizePeriodSeconds)

    _multipleRandomWinners.save()

    // Start listening for events from the dynamically generated contract
    PeriodicPrizeStrategyTemplate.create(multipleWinners)
  }

  return _multipleRandomWinners as PeriodicPrizeStrategy // why is this casting neccessary?
}
