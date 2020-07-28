import { Address, Bytes, BigInt, log } from "@graphprotocol/graph-ts"
import {
  PrizePool,
  PrizeStrategy,
  Prize,
} from '../../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../../generated/CompoundPrizePoolBuilder/ERC20'
import {
  PrizePool as PrizePoolContract,
} from '../../generated/templates/PrizePool/PrizePool'
import {
  PrizeStrategy as PrizeStrategyContract,
} from '../../generated/templates/PrizeStrategy/PrizeStrategy'
import {
  PrizeStrategy as PrizeStrategyTemplate,
  PrizePool as PrizePoolTemplate
} from '../../generated/templates'

import { prizeId } from './idTemplates'
import { createSponsorship } from '../helpers/createSponsorship'
import { createTicket } from '../helpers/createTicket'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

export function loadOrCreatePrizeStrategy(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
): PrizeStrategy {
  let _prizeStrategy = PrizeStrategy.load(prizePool.toHex())

  if (!_prizeStrategy) {
    _prizeStrategy = new PrizeStrategy(prizeStrategy.toHex())
    const boundPrizeStrategy = PrizeStrategyContract.bind(prizeStrategy)


    // const boundYieldToken = ERC20Contract.bind(boundPrizeStrategy.cToken())
    // _prizeStrategy.yieldToken = boundPrizeStrategy.cToken()
    // _prizeStrategy.yieldDecimals = BigInt.fromI32(boundYieldToken.decimals())
    // _prizeStrategy.yieldName = boundYieldToken.name()
    // _prizeStrategy.yieldSymbol = boundYieldToken.symbol()
    

    
    _prizeStrategy.compoundPrizePoolBuilder = builder.toHex()
    _prizeStrategy.creator = creator

    // _prizeStrategy.prizePoolModuleManager = moduleManager.toHex()

    _prizeStrategy.prizePool = prizePool.toHex()
    _prizeStrategy.ticket = boundPrizeStrategy.ticket()
    _prizeStrategy.rng = boundPrizeStrategy.rng()
    _prizeStrategy.sponsorship = boundPrizeStrategy.sponsorship()
    // _prizeStrategy.trustedForwarder = boundPrizeStrategy.trustedForwarder()
    _prizeStrategy.governor = boundPrizeStrategy.governor()

    _prizeStrategy.currentPrizeId = ONE
    _prizeStrategy.currentState = 'Opened'

    _prizeStrategy.prizePeriodSeconds = boundPrizeStrategy.prizePeriodSeconds()
    // _prizeStrategy.prizePeriodStartedAt = boundPrizeStrategy.prizePeriodStartedAt()

    _prizeStrategy.exitFeeMantissa = boundPrizeStrategy.exitFeeMantissa()
    _prizeStrategy.creditRateMantissa = boundPrizeStrategy.creditRateMantissa()

    // const boundYieldService = CompoundYieldServiceContract.bind(yieldServiceAddress)
    // prizeStrategy.cToken = boundYieldService.token().toHex()

    // prizeStrategy.accountedBalance = boundYieldService.accountedBalance()
    // prizeStrategy.balance = boundYieldService.balance()
    // prizeStrategy.unaccountedBalance = boundYieldService.unaccountedBalance()

    // const boundCToken = CTokenInterface.bind(boundYieldService.token())
    // prizeStrategy.token = boundCToken.underlying().toHex()

    // prizeStrategy.supplyRatePerBlock = boundCToken.supplyRatePerBlock()
    // prizeStrategy.type = 'Compound' // down the road set this via createWithContext (instead of create())
    // prizeStrategy.unaccountedBalance = boundYieldService.unaccountedBalance()

    _prizeStrategy.save()




    const _pool = new PrizePool(prizePool.toHex())
    const boundPrizePool = PrizePoolContract.bind(prizePool)

    const boundToken = ERC20Contract.bind(boundPrizePool.token())
    _pool.underlyingCollateralToken = boundPrizePool.token()
    _pool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _pool.underlyingCollateralName = boundToken.name()
    _pool.underlyingCollateralSymbol = boundToken.symbol()

    _pool.prizeStrategy = prizeStrategy.toHex()

    _pool.playerCount = ZERO

    const callResult = boundPrizePool.try_maxExitFeeMantissa()
    if (callResult.reverted) {
      log.info("maxExitFeeMantissa reverted", [])
    } else {
      _pool.maxExitFeeMantissa = callResult.value
    }
    
    _pool.maxTimelockDuration = boundPrizePool.maxTimelockDuration()
    _pool.timelockTotalSupply = boundPrizePool.timelockTotalSupply()

    const boundTicket = ERC20Contract.bind(Address.fromString(_prizeStrategy.ticket.toHex()))
    _pool.totalSupply = boundTicket.totalSupply()

    _pool.save()

    // const prize = new Prize(prizeId(
    //   prizeStrategy.toHexString(),
    //   _prizeStrategy.currentPrizeId.toString()
    // ))
    // prize.prizeStrategy = prizeStrategy.toHex()
    // prize.save()



    createSponsorship(
      prizeStrategy,
      boundPrizeStrategy.sponsorship()
    )

    createTicket(
      prizeStrategy,
      boundPrizeStrategy.ticket()
    )



    // Start listening for events from the dynamically generated contract
    PrizeStrategyTemplate.create(prizeStrategy)

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
  }

  return _prizeStrategy as PrizeStrategy
}
