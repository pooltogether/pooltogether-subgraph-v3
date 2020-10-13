import { Address, log } from '@graphprotocol/graph-ts'

import {
  PrizePool,
  SingleRandomWinner,
} from '../generated/schema'

import {
  ControlledToken as ControlledTokenContract
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  SingleRandomWinner as SingleRandomWinnerContract,
  TokenListenerUpdated,
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

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'
import { loadOrCreateSingleRandomWinner } from './helpers/loadOrCreateSingleRandomWinner'
import {
  loadOrCreateExternalErc20Award,
  loadOrCreateExternalErc721Award,
} from './helpers/loadOrCreateExternalAward'
import { prizeId } from './helpers/idTemplates'

import { ONE } from './helpers/common'


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _prizeStrategy = loadOrCreateSingleRandomWinner(event.address)
  _prizeStrategy.owner = event.params.newOwner
  _prizeStrategy.save()
}

export function handleTokenListenerUpdated(event: TokenListenerUpdated): void {
  const _prizeStrategy = loadOrCreateSingleRandomWinner(event.address)
  const _comptroller = loadOrCreateComptroller(event.params.tokenListener)

  _prizeStrategy.tokenListener = _comptroller.id
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
    _prizePool.currentPrize
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
    _prizePool.currentPrize
  )
  _prize.awardedOperator = event.params.operator
  _prize.randomNumber = event.params.randomNumber
  _prize.awardedBlock = event.block.number
  _prize.awardedTimestamp = event.block.timestamp

  const boundToken = ControlledTokenContract.bind(Address.fromString(_prizeStrategy.ticket))
  _prize.totalTicketSupply = boundToken.totalSupply()

  _prize.save()

  _prizePool.currentState = "Awarded"
  // _prizePool.currentPrize = _prizePool.currentPrize.plus(ONE)
  
  const newPrizeId = _prize.id.split('-')[1]
  const _newPrize = loadOrCreatePrize(_prizeStrategy.prizePool, newPrizeId)
  _newPrize.save()
  _prizePool.currentPrize = prizeId(_prizeStrategy.prizePool, newPrizeId)

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
