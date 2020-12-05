import { log, store } from '@graphprotocol/graph-ts'
import {
  ControlledToken,
  PrizePool,
  SingleRandomWinner,
} from '../generated/schema'

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

import { externalAwardId } from './helpers/idTemplates'
import { ONE } from './helpers/common'


export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  // This is essentially the 'initialization' event for 3.0.1 SingleRandomWinner strats, unfortunately, so we need to set up the object here.
  loadOrCreateSingleRandomWinner(event.address)
}

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

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  log.warning("handlePrizePoolAwardStarted", [])
  const _prizeStrategy = SingleRandomWinner.load(event.address.toHex())
  const boundPrizeStrategy = SingleRandomWinnerContract.bind(event.address)

  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)
  log.warning("handlePrizePoolAwardStarted: found prize pool:::: ", [_prizeStrategy.prizePool])
  _prizePool.currentState = "Started"
  log.warning("handlePrizePoolAwardStarted: setting prize count", [])
  _prizePool.prizesCount = _prizePool.prizesCount.plus(ONE)
  _prizePool.save()

  log.warning("handlePrizePoolAwardStarted: loadOrCreatePrize", [])
  const _prize = loadOrCreatePrize(
    _prizeStrategy.prizePool,
    _prizePool.currentPrizeId.toString()
  )

  log.warning("handlePrizePoolAwardStarted: setting fields", [])
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

  const controlledToken = ControlledToken.load(_prizeStrategy.ticket)
  
  _prize.awardedOperator = event.params.operator
  _prize.randomNumber = event.params.randomNumber
  _prize.awardedBlock = event.block.number
  _prize.awardedTimestamp = event.block.timestamp
  _prize.totalTicketSupply = controlledToken.totalSupply
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

  const externalAward = loadOrCreateExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20)
  externalAward.save()
}

export function handleExternalErc20AwardRemoved(event: ExternalErc20AwardRemoved): void {
  const _prizeStrategyAddress = event.address.toHex()
  const id = externalAwardId(_prizeStrategyAddress, event.params.externalErc20Award.toHex())
  log.warning("removing 20 award with id {}", [id])
  store.remove('ExternalErc20Award', id)
}

export function handleExternalErc721AwardAdded(event: ExternalErc721AwardAdded): void {
  const _singleRandomWinnerAddress = event.address.toHex()

  const externalAward = loadOrCreateExternalErc721Award(_singleRandomWinnerAddress, event.params.externalErc721)

  externalAward.tokenIds = event.params.tokenIds
  externalAward.save()
}

export function handleExternalErc721AwardRemoved(event: ExternalErc721AwardRemoved): void {
  const _prizeStrategyAddress = event.address.toHex()
  const id = externalAwardId(_prizeStrategyAddress, event.params.externalErc721Award.toHex())
  log.warning("removing 721 award with id {}", [id])
  store.remove('ExternalErc721Award', id)
}
