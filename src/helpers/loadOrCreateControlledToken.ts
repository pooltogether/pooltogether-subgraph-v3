import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ControlledToken,
} from '../../generated/schema'

import {
  ControlledToken as ControlledTokenContract
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO } from './common'

export function loadOrCreateControlledToken(
  tokenAddress: Address
): ControlledToken {
  let controlledToken = ControlledToken.load(tokenAddress.toHexString())
  if (!controlledToken) {
    controlledToken = new ControlledToken(tokenAddress.toHex())
    const boundToken = ControlledTokenContract.bind(tokenAddress)
  
    const tryControllerCall = boundToken.try_controller()
    if(tryControllerCall.reverted){
      log.warning("try_controller() reverted ",[])
    }
    else{
      controlledToken.controller = tryControllerCall.value.toHexString()
    }
  
    
    let controlledTokenName = boundToken.try_name()
    if(controlledTokenName.reverted){
      log.info('ERC20 try_name() call reverted', [])
    }
    else{
      controlledToken.name = controlledTokenName.value
    }


    let controlledTokenSymbol = boundToken.try_symbol()
    if(controlledTokenSymbol.reverted){
      log.info('ERC20 try_symbol() call reverted', [])
    }
    else{
      controlledToken.symbol = controlledTokenSymbol.value
    }
 
    let tryDecimalsCallResult = boundToken.try_decimals()
    if(tryDecimalsCallResult.reverted) {
      log.info('ERC20 try_decimals() call reverted', [])
    }
    else{
      controlledToken.decimals = BigInt.fromI32(tryDecimalsCallResult.value)
    }
    controlledToken.numberOfHolders = ZERO
    controlledToken.totalSupply = ZERO
  
    controlledToken.save()
  }

  return controlledToken as ControlledToken
}
