import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ControlledToken,
} from '../../generated/schema'

import {
  ControlledToken as ControlledTokenTemplate,
} from '../../generated/templates'

import {
  ControlledToken as ControlledTokenContract
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO } from './common'

export function loadOrCreateControlledToken(
  tokenAddress: Address,
  prizePoolAddress: Address,
): ControlledToken {
  let controlledToken = ControlledToken.load(tokenAddress.toHexString())
  if (!controlledToken) {
    controlledToken = new ControlledToken(tokenAddress.toHex())
    const boundToken = ControlledTokenContract.bind(tokenAddress)
  
    controlledToken.prizePool = prizePoolAddress.toHex()
    
    let controlledTokenName = boundToken.try_name()
    if(controlledTokenName.reverted){
      log.info('ERC20 try_name() call reverted', [])
    }else{
      controlledToken.name = controlledTokenName.value
    }


    let controlledTokenSymbol = boundToken.try_symbol()
    if(controlledTokenSymbol.reverted){
      log.info('ERC20 try_symbol() call reverted', [])
    }else{
      controlledToken.symbol = controlledTokenSymbol.value
    }
 
    let tryDecimalsCallResult = boundToken.try_decimals()
    if (tryDecimalsCallResult.reverted) {
      log.info('ERC20 try_decimals() call reverted', [])
    } else {
      controlledToken.decimals = tryDecimalsCallResult.value
    }
    controlledToken.numberOfHolders = ZERO
    controlledToken.totalSupply = ZERO
    controlledToken.controller = prizePoolAddress.toHex()
  
    controlledToken.save()
  
    ControlledTokenTemplate.create(tokenAddress)
  }

  return controlledToken as ControlledToken
}
