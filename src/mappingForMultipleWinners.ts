import {NumberOfWinnersSet, PrizePoolAwarded, PrizePoolAwardStarted, SplitExternalErc20AwardsSet} from "../generated/templates/MultipleWinners/MultipleWinners"

import { store, BigInt, log, Address } from '@graphprotocol/graph-ts'
import {
  ControlledToken,
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
  MultipleWinners as MultipleWinnersContract
} from '../generated/templates/MultipleWinners/MultipleWinners'

import {
  loadOrCreateMultipleWinnersExternalErc20Award,
  loadOrCreateMultipleWinnersExternalErc721Award,
} from './helpers/loadOrCreateMultipleWinnersExternalAward'

import {Initialized} from "../generated/templates/MultipleWinners/MultipleWinners"
import { ONE } from "./helpers/common"
import { loadOrCreatePrize } from "./helpers/loadOrCreatePrize"
import { loadOrCreateControlledToken } from "./helpers/loadOrCreateControlledToken"



export function handleNumberOfWinnersSet(event: NumberOfWinnersSet) : void {
    let multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHex())
    multipleWinners.numberOfWinners = event.params.numberOfWinners
    multipleWinners.save()
}

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  log.warning("Prize Pool Opened!",[])
  // no-op
}

export function handleSplitExternalErc20AwardsSet(event: SplitExternalErc20AwardsSet): void {
  let _prizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  _prizeStrategy.splitExternalERC20Awards = event.params.splitExternalErc20Awards;
  _prizeStrategy.save()
}

export function handlePeriodicPrizeInitialized(event: Initialized) : void {
    const prizePool = event.params.prizePool
    const rng =event.params.rng
    const ticket = event.params.ticket
    const sponsorship = event.params.sponsorship
    const startTime = event.params.prizePeriodStart
    const prizePeriod = event.params.prizePeriodSeconds

    log.info("MultipleWinners being intialized for {} ",[event.address.toHexString()])


    let multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHex())
    if(!multipleWinners){
      log.error("multiple winners does not exist for {} ",[event.address.toHexString()])
      multipleWinners = new MultipleWinnersPrizeStrategy(event.address.toHexString())
    }

    const _checkPrizePool = PrizePool.load(prizePool.toHex())
    if(!_checkPrizePool){
      log.info("checkprizepool setting mw prizePool to null! for {}",[event.address.toHexString()])
      multipleWinners.prizePool = null
    }
    else{
      multipleWinners.prizePool = _checkPrizePool.id
    }

    
    multipleWinners.prizePeriodStartedAt = startTime
    multipleWinners.rng = rng
    multipleWinners.ticket = ticket.toHexString()
    multipleWinners.sponsorship = sponsorship.toHexString()
    multipleWinners.prizePeriodEndAt = startTime.plus(prizePeriod)
    multipleWinners.prizePeriodSeconds = prizePeriod

    multipleWinners.numberOfWinners = ONE// mock value until numberOfWinners event fired

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
  
  log.info("PrizePoolAwarded called for  {}", [event.address.toHexString()])

  const mwStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  if(!mwStrategy.prizePool){   // if prizePool is empty just skip (temp)
    log.info("prizepool not linked to strategy for prize strategy {}",[event.address.toHexString()])
    return
  }

  const _prizePool = PrizePool.load(mwStrategy.prizePool)

  // Record prize history
  const _prize = loadOrCreatePrize(
    mwStrategy.prizePool,
    _prizePool.currentPrizeId.toString()
  )
  _prizePool.currentState = "Awarded"
  _prizePool.currentPrizeId = _prizePool.currentPrizeId.plus(ONE)
  _prizePool.save()

  _prize.awardedOperator = event.params.operator
  _prize.randomNumber = event.params.randomNumber
  
  _prize.awardedBlock = event.block.number
  _prize.awardedTimestamp = event.block.timestamp
  
  const controlledToken = loadOrCreateControlledToken(Address.fromString(mwStrategy.ticket))
  
  _prize.totalTicketSupply = controlledToken.totalSupply
  _prize.save()


}


export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  const _prizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  const boundPrizeStrategy = MultipleWinnersContract.bind(event.address)

  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)
  if(!_prizePool){
    log.info("prize pool does not exist {}",[_prizeStrategy.id])
    return
  }
  _prizePool.currentState = "Started"
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
