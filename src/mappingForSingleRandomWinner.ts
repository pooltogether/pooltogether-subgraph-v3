import { log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
  SingleRandomWinner,
  ControlledToken,
} from '../generated/schema'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwarded,
  RngServiceUpdated,
  OwnershipTransferred,
  ExternalErc20AwardAdded,
  ExternalErc20AwardRemoved,
  ExternalErc721AwardAdded,
  ExternalErc721AwardRemoved,
} from '../generated/templates/SingleRandomWinner/SingleRandomWinner'

import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'
import {
  loadOrCreateExternalErc20Award,
  loadOrCreateExternalErc721Award,
} from './helpers/loadOrCreateExternalAward'

import { ONE } from './helpers/common'


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _prizeStrategy = SingleRandomWinner.load(event.address.toHex())
  _prizeStrategy.owner = event.params.newOwner
  _prizeStrategy.save()
}

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  // no-op
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  const _prizeStrategy = SingleRandomWinner.load(event.address.toHex())
  const boundPrizeStrategy = SingleRandomWinnerContract.bind(event.address)

  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)
  _prizePool.currentState = "Started"
  _prizePool.prizesCount = _prizePool.prizesCount.plus(ONE)
  _prizePool.save()

  const _prize = loadOrCreatePrize(
    _prizeStrategy.prizePool,
    _prizePool.currentPrizeId.toString()
  )

  _prize.prizePeriodStartedTimestamp = boundPrizeStrategy.prizePeriodStartedAt()
  _prize.awardStartOperator = event.params.operator
  _prize.lockBlock = event.params.rngLockBlock
  _prize.rngRequestId = event.params.rngRequestId
  _prize.save()
}

export function handlePrizePoolAwarded(event: PrizePoolAwarded): void {
  const _prizeStrategy = SingleRandomWinner.load(event.address.toHexString())
  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)

  // Record prize history
  const _prize = loadOrCreatePrize(
    _prizeStrategy.prizePool,
    _prizePool.currentPrizeId.toString()
  )
  _prize.awardedOperator = event.params.operator
  _prize.randomNumber = event.params.randomNumber
  _prize.awardedBlock = event.block.number
  _prize.awardedTimestamp = event.block.timestamp
  _prize.totalTicketSupply = _prizePool.totalSupply
  _prize.save()

  _prizePool.currentState = "Awarded"
  _prizePool.currentPrizeId = _prizePool.currentPrizeId.plus(ONE)
  _prizePool.save()
}

export function handleRngServiceUpdated(event: RngServiceUpdated): void {
  const _prizeStrategy = SingleRandomWinner.load(event.address.toHexString())
  _prizeStrategy.rng = event.params.rngService
  _prizeStrategy.save()
}

export function handleExternalErc20AwardAdded(event: ExternalErc20AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()
  const _prizeStrategy = SingleRandomWinner.load(_prizeStrategyAddress)

  const externalAward = loadOrCreateExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20)

  const externalErc20Awards = _prizeStrategy.externalErc20Awards
  externalErc20Awards.push(externalAward.id)
  _prizeStrategy.externalErc20Awards = externalErc20Awards

  _prizeStrategy.save()
}

export function handleExternalErc20AwardRemoved(event: ExternalErc20AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc20AwardRemoved', [])
}

export function handleExternalErc721AwardAdded(event: ExternalErc721AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()
  const _prizeStrategy = SingleRandomWinner.load(_prizeStrategyAddress)

  const externalAward = loadOrCreateExternalErc721Award(_prizeStrategyAddress, event.params.externalErc721)
  externalAward.tokenIds = event.params.tokenIds

  const externalErc721Awards = _prizeStrategy.externalErc721Awards
  externalErc721Awards.push(externalAward.id)
  _prizeStrategy.externalErc721Awards = externalErc721Awards

  _prizeStrategy.save()
}

export function handleExternalErc721AwardRemoved(event: ExternalErc721AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc721AwardRemoved', [])
}
