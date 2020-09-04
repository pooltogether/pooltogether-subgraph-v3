
export function prizeId(prizePool: string, currentPrizeId: string): string {
  return prizePool + '-' + currentPrizeId
}

export function playerId(prizePoolAddress: string, playerAddress: string): string {
  return prizePoolAddress + '-' + playerAddress
}

export function dripTokenId(
  comptrollerAddress: string,
  sourceAddress: string,
  measureTokenAddress: string,
  dripTokenAddress: string,
  isReferral: string = '0'
): string {
  return comptrollerAddress + '-' + sourceAddress + '-' + measureTokenAddress + '-' + dripTokenAddress + '-' + isReferral
}

export function dripTokenPlayerId(
  comptrollerAddress: string,
  dripTokenAddress: string,
  playerAddress: string
): string {
  return comptrollerAddress + '-' + dripTokenAddress + '-' + playerAddress
}

export function balanceDripPlayerId(
  comptrollerAddress: string,
  playerAddress: string,
  balanceDripId: string
): string {
  return comptrollerAddress + '-' + playerAddress + '-' + balanceDripId
}

export function volumeDripPlayerId(
  volumeDripId: string,
  playerAddress: string,
): string {
  return volumeDripId + '-' + playerAddress
}

export function volumeDripPeriodId(
  volumeDripId: string,
  periodIndex: string,
): string {
  return volumeDripId + '-' + periodIndex
}
