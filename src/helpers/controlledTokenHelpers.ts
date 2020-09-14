import {
  Transfer__Params
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO_ADDRESS } from './common'

export function determineTransferType(params: Transfer__Params): string {
  let transferType = "Mint"

  if (
    params.from.toHex() != ZERO_ADDRESS &&
    params.to.toHex() != ZERO_ADDRESS
  ) {
    transferType = "UserToUser"
  } else if (params.to.toHex() == ZERO_ADDRESS) {
    transferType = "Burn"
  }

  return transferType
}
