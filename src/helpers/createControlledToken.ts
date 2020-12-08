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

export function createControlledToken(
  tokenAddress: Address,
  prizePoolAddress: Address,
): ControlledToken {
  const controlledToken = new ControlledToken(tokenAddress.toHex())
  const boundToken = ControlledTokenContract.bind(tokenAddress)

  controlledToken.prizePool = prizePoolAddress.toHex()

  controlledToken.name = boundToken.name()
  controlledToken.symbol = boundToken.symbol()

  let tryDecimalsCallResult = boundToken.try_decimals()
  if (tryDecimalsCallResult.reverted) {
    log.info('ERC20 try_decimals() call reverted', [])
  } else {
    controlledToken.decimals = BigInt.fromI32(tryDecimalsCallResult.value)
  }
  controlledToken.numberOfHolders = ZERO
  controlledToken.totalSupply = ZERO

  controlledToken.save()

  ControlledTokenTemplate.create(tokenAddress)

  return controlledToken as ControlledToken
}
