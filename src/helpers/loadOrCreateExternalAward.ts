import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

import {
  MultipleWinnersExternalErc20Award,
  MultipleWinnersExternalErc721Award
} from '../../generated/schema'

import { externalAwardId } from './idTemplates'


export function loadOrCreateExternalErc20Award(prizeStrategyAddress: string, tokenAddress: Address): MultipleWinnersExternalErc20Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = MultipleWinnersExternalErc20Award.load(awardId)
  if (!award) {
    log.warning("creating an externalErc20 entity ",[])
    award = new MultipleWinnersExternalErc20Award(awardId)
    award.prizeStrategy = prizeStrategyAddress
    award.address = tokenAddress

    const boundToken = ERC20Contract.bind(tokenAddress)

    let tryNameCallResult = boundToken.try_name()
    if (tryNameCallResult.reverted) {
      log.info('ERC20 try_name() call reverted', [])
    } else {
      award.name = tryNameCallResult.value
    }
        
    let trySymbolCallResult = boundToken.try_symbol()
    if (trySymbolCallResult.reverted) {
      log.info('ERC20 try_symbol call reverted', [])
    } else {
      award.symbol = trySymbolCallResult.value
    }
    
    let tryDecimalsCallResult = boundToken.try_decimals()
    if (tryDecimalsCallResult.reverted) {
      log.info('ERC20 try_decimals() call reverted', [])
    } else {
      award.decimals = BigInt.fromI32(tryDecimalsCallResult.value)
    }

    award.save()
  }
  else{
    log.warning("external erc20 already existed ",[])
  }

  return award as MultipleWinnersExternalErc20Award
}

export function loadOrCreateExternalErc721Award(prizeStrategyAddress: string, tokenAddress: Address): MultipleWinnersExternalErc721Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = MultipleWinnersExternalErc721Award.load(awardId)
  if (!award) {
    award = new MultipleWinnersExternalErc721Award(awardId)
    award.prizeStrategy = prizeStrategyAddress
    award.address = tokenAddress
    award.save()
  }

  return award as MultipleWinnersExternalErc721Award
}
