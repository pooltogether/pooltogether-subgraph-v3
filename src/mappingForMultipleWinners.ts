import {ProxyCreated} from "../generated/MultipleWinnersProxyFactory/MultipleWinnersProxyFactory"

import { MultipleWinners as MultipleWinnersTemplate } from "../generated/templates"

import {NumberOfWinnersSet} from "../generated/templates/MultipleWinners/MultipleWinners"

import { BigInt, log } from '@graphprotocol/graph-ts'
import {
MultipleWinnersExternalErc20Award,
MultipleWinnersExternalErc721Award,
  MultipleWinnersPrizeStrategy,
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


export function handleMultipleWinnersCreated(event: ProxyCreated) : void{
    MultipleWinnersTemplate.create(event.params.proxy)
}


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
    multipleWinners.ticket = ticket
    multipleWinners.sponsorship = sponsorship
    multipleWinners.prizePeriodEndAt = startTime.plus(prizePeriod)
    multipleWinners.prizePeriodSeconds = prizePeriod

    multipleWinners.numberOfWinners = new BigInt(1) // mock value until numberOfWinners event fired

    multipleWinners.save()

}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
   
  let _perodicPrizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
    // this event is firing before the initialized this will always be null

  if(_perodicPrizeStrategy == null){
    _perodicPrizeStrategy = new MultipleWinnersPrizeStrategy(event.address.toHex())
    
    // set fields to blank/generic for now - Initialized event called straight after
    _perodicPrizeStrategy.prizePeriodSeconds = new BigInt(0)
    _perodicPrizeStrategy.prizePeriodStartedAt = new BigInt(0)
    _perodicPrizeStrategy.prizePeriodEndAt = new BigInt(0)

  }

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
  const externalAward : MultipleWinnersExternalErc20Award= loadOrCreateMultipleWinnersExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20)
  externalAward.save()
}

export function handleExternalErc20AwardRemoved(event: ExternalErc20AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc20AwardRemoved', [])
}

export function handleExternalErc721AwardAdded(event: ExternalErc721AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()

  const externalAward : MultipleWinnersExternalErc721Award = loadOrCreateMultipleWinnersExternalErc721Award(_prizeStrategyAddress, event.params.externalErc721)

  externalAward.tokenIds = event.params.tokenIds
  externalAward.save()
}

export function handleExternalErc721AwardRemoved(event: ExternalErc721AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc721AwardRemoved', [])
}
