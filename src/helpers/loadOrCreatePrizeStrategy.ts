import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  PrizeStrategy,
  Prize,
} from '../../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../../generated/PrizeStrategyBuilder/ERC20'
import {
  PrizeStrategy as PrizeStrategyContract,
} from '../../generated/templates/PrizeStrategy/PrizeStrategy'
import {
  PrizeStrategy as PrizeStrategyTemplate
} from '../../generated/templates'

import { prizeId } from './idTemplates'
import { createSponsorship } from '../helpers/createSponsorship'
import { createTicket } from '../helpers/createTicket'

const ZERO = BigInt.fromI32(0)

export function loadOrCreatePrizeStrategy(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
): PrizeStrategy {
  let _prizePool = PrizeStrategy.load(prizePool.toHex())

  if (!_prizePool) {
    _prizePool = new PrizeStrategy(prizePool.toHex())
    const boundPrizeStrategy = PrizeStrategyContract.bind(prizePool)

    const boundPeriodicPrizeStrategy = PrizeStrategyContract.bind(prizePool)

    // const boundYieldToken = ERC20Contract.bind(boundPeriodicPrizeStrategy.cToken())
    // _prizePool.yieldToken = boundPeriodicPrizeStrategy.cToken()
    // _prizePool.yieldDecimals = BigInt.fromI32(boundYieldToken.decimals())
    // _prizePool.yieldName = boundYieldToken.name()
    // _prizePool.yieldSymbol = boundYieldToken.symbol()
    
    const boundToken = ERC20Contract.bind(boundPeriodicPrizeStrategy.token())
    _prizePool.underlyingCollateralToken = boundPeriodicPrizeStrategy.token()
    _prizePool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _prizePool.underlyingCollateralName = boundToken.name()
    _prizePool.underlyingCollateralSymbol = boundToken.symbol()
    
    _prizePool.PrizeStrategyBuilder = builder.toHex()
    _prizePool.creator = creator
    _prizePool.prizeStrategy = prizeStrategy
    _prizePool.currentState = 'Opened'

    _prizePool.currentPrizeId = BigInt.fromI32(1)

    // _prizePool.prizePoolModuleManager = moduleManager.toHex()

    _prizePool.prizeStrategy = boundPeriodicPrizeStrategy.prizeStrategy()
    _prizePool.sponsorship = boundPeriodicPrizeStrategy.sponsorship()
    _prizePool.ticket = boundPeriodicPrizeStrategy.ticket()
    _prizePool.rng = boundPeriodicPrizeStrategy.rng()

    _prizePool.prizePeriodSeconds = boundPeriodicPrizeStrategy.prizePeriodSeconds()
    _prizePool.prizePeriodStartedAt = boundPeriodicPrizeStrategy.prizePeriodStartedAt()

    _prizePool.playerCount = ZERO

    const boundTicket = ERC20Contract.bind(Address.fromString(_prizePool.ticket.toHex()))
    _prizePool.totalSupply = boundTicket.totalSupply()
    
    const prize = new Prize(prizeId(
      prizePool.toHexString(),
      _prizePool.currentPrizeId.toString()
    ))
    prize.prizePool = prizePool.toHex()
    prize.save()


    createSponsorship(
      prizePool,
      boundPrizeStrategy.sponsorship()
    )

    createTicket(
      prizePool,
      boundPrizeStrategy.ticket()
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
    PrizeStrategyTemplate.create(prizePool)
  }

  return _prizePool as PrizeStrategy
}
