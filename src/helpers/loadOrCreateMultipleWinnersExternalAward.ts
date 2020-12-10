import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

import {
  MultipleWinnersExternalErc20Award,
  MultipleWinnersExternalErc721Award,
} from '../../generated/schema'

import { externalAwardId } from './idTemplates'


export function loadOrCreateMultipleWinnersExternalErc20Award(prizeStrategyAddress: string, tokenAddress: Address): MultipleWinnersExternalErc20Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = MultipleWinnersExternalErc20Award.load(awardId)
  if (!award) {
    log.warning("creating an multiple winners externalErc20 entity ",[])
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
      award.decimals = tryDecimalsCallResult.value
    }

    award.save()
  }
  else{
    log.warning("external multiple winners external erc20 already existed ",[])
  }

  return award as MultipleWinnersExternalErc20Award
}

export function loadOrCreateMultipleWinnersExternalErc721Award(prizeStrategyAddress: string, tokenAddress: Address): MultipleWinnersExternalErc721Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = MultipleWinnersExternalErc721Award.load(awardId)
  if (!award) {
    log.warning("creating an multiple winners externalErc721 entity ",[])
    award = new MultipleWinnersExternalErc721Award(awardId)
    award.prizeStrategy = prizeStrategyAddress
    award.address = tokenAddress
    award.save()
  }
  else{
    log.warning("external multiple winners external erc721 already existed ",[])
  }

  return award as MultipleWinnersExternalErc721Award
}
