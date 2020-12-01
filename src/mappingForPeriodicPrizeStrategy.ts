import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
  PeriodicPrizeStrategy,
} from '../generated/schema'

import {
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
} from '../generated/templates/MultipleWinners/MultipleWinners'

import {
  MultipleWinners as MultipleWinnersContract} from "../generated/templates/MultipleWinners/MultipleWinners"

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

import {
  loadOrCreateExternalErc20Award,
  loadOrCreateExternalErc721Award,
} from './helpers/loadOrCreateExternalAward'

import {Initialized} from "../generated/templates/PeriodicPrizeStrategy/PeriodicPrizeStrategy"

import { ONE } from './helpers/common'


export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  log.warning("Prize Pool Opened!",[])
  // no-op
}


export function handlePeriodicPrizeInitialized(event: Initialized) : void {
 const prizePool = event.params._prizePool
 const rng =event.params._rng
 const ticket = event.params._ticket
 const sponsorship = event.params._sponsorship
 const startTime = event.params._prizePeriodStart
 const prizePeriod = event.params._prizePeriodSeconds
 
 let periodicPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHex())
 if(periodicPrizeStrategy == null){
    periodicPrizeStrategy = new PeriodicPrizeStrategy(event.address.toHex())
    periodicPrizeStrategy.prizePool=prizePool.toHex()
    periodicPrizeStrategy.prizePeriodSeconds = startTime
    periodicPrizeStrategy.rng = rng
    periodicPrizeStrategy.ticket = ticket.toHex()
    periodicPrizeStrategy.sponsorship = sponsorship.toHex()
    periodicPrizeStrategy.prizePeriodSeconds = prizePeriod

    periodicPrizeStrategy.numberOfWinners = new BigInt(1) //set to 1 initially? 

    periodicPrizeStrategy.save()
 }
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
   
  let _perodicPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHex())

  if(_perodicPrizeStrategy == null){
    log.warning("periodic prize strategy needs to be created for id {}", [event.address.toHex()])
    _perodicPrizeStrategy = new PeriodicPrizeStrategy(event.address.toHex())
    
    // this event is firing before the initialized
    // set fields to blank/generic for now - Initialized event called straight after
    _perodicPrizeStrategy.prizePeriodSeconds = new BigInt(0)
    _perodicPrizeStrategy.prizePeriodStartedAt = new BigInt(0)
    _perodicPrizeStrategy.prizePeriodEndAt = new BigInt(0)

  }

  _perodicPrizeStrategy.owner = event.params.newOwner
  _perodicPrizeStrategy.save()
}

export function handleTokenListenerUpdated(event: TokenListenerUpdated): void {
 
  log.warning("handleTokenListenerUpdated for id {} ",[event.address.toHex()])
  let _prizeStrategy = PeriodicPrizeStrategy.load(event.address.toHex())
  // AG: is there a way a prize stratgy cannot be initialized (==null)?

  const _comptroller = loadOrCreateComptroller(event.params.tokenListener)

  _prizeStrategy.tokenListener = _comptroller.id
  _prizeStrategy.save()
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  
  const _perodicPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHex())
  const boundPrizeStrategy = MultipleWinnersContract.bind(event.address)

  const _prizePool = PrizePool.load(_perodicPrizeStrategy.prizePool)
  _prizePool.currentState = "Started"
  _prizePool.prizesCount = _prizePool.prizesCount.plus(ONE)
  _prizePool.save()

  const _prize = loadOrCreatePrize(
    _perodicPrizeStrategy.prizePool,
    _prizePool.currentPrizeId.toString()
  )

  _prize.prizePeriodStartedTimestamp = boundPrizeStrategy.prizePeriodStartedAt()
  _prize.awardStartOperator = event.params.operator
  _prize.lockBlock = event.params.rngLockBlock
  _prize.rngRequestId = event.params.rngRequestId
  _prize.save()
}

export function handlePrizePoolAwarded(event: PrizePoolAwarded): void {
  const _peroidcPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHexString())
  const _prizePool = PrizePool.load(_peroidcPrizeStrategy.prizePool)

  // Record prize history
  const _prize = loadOrCreatePrize(
    _peroidcPrizeStrategy.prizePool,
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
  const _perodicPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHexString())
  _perodicPrizeStrategy.rng = event.params.rngService
  _perodicPrizeStrategy.save()
}

export function handleExternalErc20AwardAdded(event: ExternalErc20AwardAdded): void {
  const _prizeStrategyAddress = event.address.toHex()

  const externalAward = loadOrCreateExternalErc20Award(_prizeStrategyAddress, event.params.externalErc20)
  externalAward.save()
}

export function handleExternalErc20AwardRemoved(event: ExternalErc20AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc20AwardRemoved', [])
}

export function handleExternalErc721AwardAdded(event: ExternalErc721AwardAdded): void {
  const _singleRandomWinnerAddress = event.address.toHex()

  const externalAward = loadOrCreateExternalErc721Award(_singleRandomWinnerAddress, event.params.externalErc721)

  externalAward.tokenIds = event.params.tokenIds
  externalAward.save()
}

export function handleExternalErc721AwardRemoved(event: ExternalErc721AwardRemoved): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc) are added to the prize
  log.warning('implement handleExternalErc721AwardRemoved', [])
}
