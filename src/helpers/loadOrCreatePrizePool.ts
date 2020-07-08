import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  PrizePool,
  Prize,
} from '../../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../../generated/PrizePoolBuilder/ERC20'
import {
  CompoundPeriodicPrizePool as CompoundPeriodicPrizePoolContract,
} from '../../generated/PrizePoolBuilder/CompoundPeriodicPrizePool'
import {
  PrizePool as PrizePoolTemplate
} from '../../generated/templates'

import { prizeId } from './idTemplates'
import { createSponsorship } from '../helpers/createSponsorship'
import { createTicket } from '../helpers/createTicket'

export function loadOrCreatePrizePool(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
): PrizePool {
  let _prizePool = PrizePool.load(prizePool.toHex())

  if (!_prizePool) {
    _prizePool = new PrizePool(prizePool.toHex())
    const boundPrizePool = CompoundPeriodicPrizePoolContract.bind(prizePool)

    const boundPeriodicPrizePool = CompoundPeriodicPrizePoolContract.bind(prizePool)

    const boundYieldToken = ERC20Contract.bind(boundPeriodicPrizePool.cToken())
    _prizePool.yieldToken = boundPeriodicPrizePool.cToken()
    _prizePool.yieldTokenName = boundYieldToken.name()
    _prizePool.yieldTokenSymbol = boundYieldToken.symbol()
    
    const boundToken = ERC20Contract.bind(boundPeriodicPrizePool.token())
    _prizePool.underlyingCollateralToken = boundPeriodicPrizePool.token()
    _prizePool.underlyingCollateralName = boundToken.name()
    _prizePool.underlyingCollateralSymbol = boundToken.symbol()

    _prizePool.prizePoolBuilder = builder.toHex()
    _prizePool.creator = creator
    _prizePool.prizeStrategy = prizeStrategy
    _prizePool.currentState = 'Opened'

    _prizePool.currentPrizeId = BigInt.fromI32(1)

    // _prizePool.prizePoolModuleManager = moduleManager.toHex()

    _prizePool.prizeStrategy = boundPeriodicPrizePool.prizeStrategy()
    _prizePool.sponsorship = boundPeriodicPrizePool.sponsorship()
    _prizePool.ticket = boundPeriodicPrizePool.ticket()
    _prizePool.rng = boundPeriodicPrizePool.rng()

    _prizePool.prizePeriodSeconds = boundPeriodicPrizePool.prizePeriodSeconds()
    _prizePool.prizePeriodStartedAt = boundPeriodicPrizePool.prizePeriodStartedAt()


    const prize = new Prize(prizeId(
      prizePool.toHexString(),
      _prizePool.currentPrizeId.toString()
    ))
    prize.prizePool = prizePool.toHex()
    prize.save()


    createSponsorship(
      prizePool,
      boundPrizePool.sponsorship()
    )

    createTicket(
      prizePool,
      boundPrizePool.ticket()
    )

    // const boundYieldService = CompoundYieldServiceContract.bind(yieldServiceAddress)
    // prizePool.cToken = boundYieldService.token().toHex()

    // prizePool.accountedBalance = boundYieldService.accountedBalance()
    // prizePool.balance = boundYieldService.balance()
    // prizePool.unaccountedBalance = boundYieldService.unaccountedBalance()

    // const boundCToken = CTokenInterface.bind(boundYieldService.token())
    // prizePool.token = boundCToken.underlying().toHex()

    // prizePool.supplyRatePerBlock = boundCToken.supplyRatePerBlock()
    // prizePool.type = 'Compound' // down the road set this via createWithContext (instead of create())
    // prizePool.unaccountedBalance = boundYieldService.unaccountedBalance()

    _prizePool.save()

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
  }

  return _prizePool as PrizePool
}
