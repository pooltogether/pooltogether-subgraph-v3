import {NumberOfWinnersSet, PrizePoolAwarded} from "../generated/templates/MultipleWinners/MultipleWinners"

import { store, BigInt, log } from '@graphprotocol/graph-ts'
import {
  MultipleWinnersPrizeStrategy, PrizePool
} from '../generated/schema'

import {
  TokenListenerUpdated,
  PrizePoolOpened,
  RngServiceUpdated,
  OwnershipTransferred,
  ExternalErc20AwardAdded,
  ExternalErc20AwardRemoved,
  ExternalErc721AwardAdded,
  ExternalErc721AwardRemoved,
} from '../generated/templates/MultipleWinners/MultipleWinners'

import {
  loadOrCreateMultipleWinnersExternalErc20Award,
  loadOrCreateMultipleWinnersExternalErc721Award,
} from './helpers/loadOrCreateMultipleWinnersExternalAward'

import {Initialized} from "../generated/templates/MultipleWinners/MultipleWinners"
import { ONE } from "./helpers/common"


export function handleNumberOfWinnersSet(event: NumberOfWinnersSet) : void {
    let multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHex())
    multipleWinners.numberOfWinners = event.params.numberOfWinners
    multipleWinners.save()
}

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  log.warning("Prize Pool Opened!",[])
  // no-op
}

export function handlePeriodicPrizeInitialized(event: Initialized) : void {
    const prizePool = event.params.prizePool
    const rng =event.params.rng
    const ticket = event.params.ticket
    const sponsorship = event.params.sponsorship
    const startTime = event.params.prizePeriodStart
    const prizePeriod = event.params.prizePeriodSeconds


    const multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHex())

    multipleWinners.prizePool=prizePool
    multipleWinners.prizePeriodStartedAt = startTime
    multipleWinners.rng = rng
    multipleWinners.ticket = ticket.toHexString()
    multipleWinners.sponsorship = sponsorship.toHexString()
    multipleWinners.prizePeriodEndAt = startTime.plus(prizePeriod)
    multipleWinners.prizePeriodSeconds = prizePeriod

    multipleWinners.numberOfWinners = new BigInt(1) // mock value until numberOfWinners event fired

    multipleWinners.save()

}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let _perodicPrizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  _perodicPrizeStrategy.owner = event.params.newOwner
  _perodicPrizeStrategy.save()
}

export function handleTokenListenerUpdated(event: TokenListenerUpdated): void {
  let _prizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  _prizeStrategy.tokenListener = event.params.tokenListener
  _prizeStrategy.save()
}

export function handleRngServiceUpdated(event: RngServiceUpdated): void {
  const _perodicPrizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHexString())
  _perodicPrizeStrategy.rng = event.params.rngService
  _perodicPrizeStrategy.save()
}

export function handleExternalErc20AwardAdded(event: ExternalErc20AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()
  const externalAward = loadOrCreateMultipleWinnersExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20)
  externalAward.save()
}

export function handlePrizePoolAwarded(event: PrizePoolAwarded) : void {

  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.currentPrizeId = _prizePool.currentPrizeId.plus(ONE)
  _prizePool.save()

}

export function handleExternalErc20AwardRemoved(event: ExternalErc20AwardRemoved): void {
  const _prizeStrategyAddress = event.address.toHex()
  const externalAward = loadOrCreateMultipleWinnersExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20Award)
  store.remove('MultipleWinnersExternalErc20Award', externalAward.id)
}

export function handleExternalErc721AwardAdded(event: ExternalErc721AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()
  const externalAward = loadOrCreateMultipleWinnersExternalErc721Award(_prizeStrategyAddress, event.params.externalErc721)
  externalAward.tokenIds = event.params.tokenIds
  externalAward.save()
}

export function handleExternalErc721AwardRemoved(event: ExternalErc721AwardRemoved): void {
  const _prizeStrategyAddress = event.address.toHex()
  const externalAward = loadOrCreateMultipleWinnersExternalErc20Award(_prizeStrategyAddress, event.params.externalErc721Award)
  store.remove('MultipleWinnersExternalErc721Award', externalAward.id)
}
