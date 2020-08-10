
export function prizeId(prizePool: string, currentPrizeId: string): string {
  return prizePool + '-' + currentPrizeId
}

export function playerId(prizePoolAddress: string, playerAddress: string): string {
  return prizePoolAddress + '-' + playerAddress
}

export function dripTokenPlayerId(
  comptrollerAddress: string,
  dripTokenAddress: string,
  playerAddress: string
): string {
  return comptrollerAddress + '-' + dripTokenAddress + '-' + playerAddress
}

export function balanceDripId(
  comptrollerAddress: string,
  sourceAddress: string,
  measureTokenAddress: string,
  dripTokenAddress: string
): string {
  return comptrollerAddress + '-' + sourceAddress + '-' + measureTokenAddress + '-' + dripTokenAddress
}

export function balanceDripPlayerId(
  comptrollerAddress: string,
  playerAddress: string,
  balanceDripId: string
): string {
  return comptrollerAddress + '-' + playerAddress + '-' + balanceDripId
}

export function volumeDripId(
  comptrollerAddress: string,
  sourceAddress: string,
  volumeDripIndex: string
): string {
  return comptrollerAddress + '-' +  sourceAddress + '-' +  volumeDripIndex
}
