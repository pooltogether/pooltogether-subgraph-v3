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
  MultipleWinners as MultipleWinnersContract,
  NumberOfWinnersSet,
  // PrizePeriodSecondsUpdated,
  PrizePoolAwarded,
  PrizePoolAwardStarted,
  // PrizeSplitRemoved,
  // PrizeSplitSet,
  SplitExternalErc20AwardsSet,
  // BlocklistSet
} from '../generated/templates/MultipleWinners/MultipleWinners'

import {
  loadOrCreateMultipleWinnersExternalErc20Award,
  loadOrCreateMultipleWinnersExternalErc721Award,
} from './helpers/loadOrCreateMultipleWinnersExternalAward'

import { Initialized } from "../generated/templates/MultipleWinners/MultipleWinners"
import { ONE } from "./helpers/common"
import { loadOrCreatePrize } from "./helpers/loadOrCreatePrize"
import { loadOrCreateControlledToken } from "./helpers/loadOrCreateControlledToken"
import { loadOrCreatePrizePool } from "./helpers/loadOrCreatePrizePool"
import { loadOrCreatePrizeSplit } from "./helpers/loadOrCreatePrizeSplit"



export function handleNumberOfWinnersSet(event: NumberOfWinnersSet) : void {
    let multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHex())
    multipleWinners.numberOfWinners = event.params.numberOfWinners
    multipleWinners.save()
}

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  log.warning("Prize Pool Opened! {} ",[event.address.toHexString()])
  // no-op
}

export function handleSplitExternalErc20AwardsSet(event: SplitExternalErc20AwardsSet): void {
  let _prizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  _prizeStrategy.splitExternalERC20Awards = event.params.splitExternalErc20Awards;
  _prizeStrategy.save()
}

// export function handlePrizePeriodSecondsUpdated(event: PrizePeriodSecondsUpdated): void {
//   let _prizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
//   _prizeStrategy.prizePeriodSeconds = event.params.prizePeriodSeconds;
//   _prizeStrategy.save()
//   log.info("debug511 Updated PrizePeriod for {} ", [event.params.prizePeriodSeconds.toHexString()])
// }

// this is called before the prizepool initializer
export function handlePeriodicPrizeInitialized(event: Initialized) : void {
    const prizePool = event.params.prizePool
    const rng =event.params.rng
    const ticket = event.params.ticket
    const sponsorship = event.params.sponsorship
    const startTime = event.params.prizePeriodStart
    const prizePeriod = event.params.prizePeriodSeconds

    log.warning("MultipleWinners being intialized for {} ",[event.address.toHexString()])


    let multipleWinners = MultipleWinnersPrizeStrategy.load(event.address.toHexString())
    if(!multipleWinners){
      log.error("debu multiple winners does not exist for {} ",[event.address.toHexString()])
      // multipleWinners = new MultipleWinnersPrizeStrategy(event.address.toHexString())
    }

    // const _checkPrizePool = PrizePool.load(prizePool.toHexString())
    // if(!_checkPrizePool){
    //   log.info("debug556 checkprizepool setting mw prizePool to null! for {}",[event.address.toHexString()])
    //   multipleWinners.prizePool = null
    // }
    // else{
    //   multipleWinners.prizePool = _checkPrizePool.id
    // }

    const _prizePool = loadOrCreatePrizePool(prizePool)
    multipleWinners.prizePool = prizePool.toHexString()


    
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
  
  log.warning("PrizePoolAwarded called for  {}", [event.address.toHexString()])

  const mwStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHex())
  if(!mwStrategy.prizePool){   // if prizePool is empty just skip (temp)
    log.warning("prizepool not linked to strategy for prize strategy {}",[event.address.toHexString()])
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
    log.warning("prize pool does not exist {}",[_prizeStrategy.id])
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

// export function handlePrizeSplitSet(event: PrizeSplitSet): void {
//   const _prizeStrategyAddress = event.address.toHex()
//   // load or create prize split
//   const prizeSplit = loadOrCreatePrizeSplit(_prizeStrategyAddress, event.params.index.toHexString())
//     prizeSplit.target = event.params.target
//     prizeSplit.percentage = BigInt.fromI32(event.params.percentage)
//     prizeSplit.tokenType = BigInt.fromI32(event.params.token)
//     prizeSplit.save()
// }

// export function handlePrizeSplitRemoved(event: PrizeSplitRemoved): void {
//   const _prizeStrategyAddress = event.address.toHex()
//   const prizeSplit = loadOrCreatePrizeSplit(_prizeStrategyAddress, event.params.target.toHexString())
//   store.remove('PrizeSplit', prizeSplit.id)
// }

// export function handleBlockListAddressSet(event: BlocklistSet) : void {
//   const _perodicPrizeStrategy = MultipleWinnersPrizeStrategy.load(event.address.toHexString())
//   let existingBlockListedAddresses = _perodicPrizeStrategy.blockListedAddresses
//   const userAddress = event.params.user
//   if(!event.params.blocklisted){ // removed from list
//     const index = existingBlockListedAddresses.indexOf(userAddress)
//     if(index > 1){
//       _perodicPrizeStrategy.blockListedAddresses = existingBlockListedAddresses.splice(index,1) //remove the element
//     }
//   } else{
//     let result = existingBlockListedAddresses
//     result.push(userAddress)
//     _perodicPrizeStrategy.blockListedAddresses = result
//   }

//   _perodicPrizeStrategy.save()
// }
