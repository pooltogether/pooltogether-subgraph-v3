
export function prizeId(_prizePool: string, _id: string): string {
  return _prizePool + '-' + _id
}

export function playerId(prizePoolAddress: string, playerAddress: string): string {
  return prizePoolAddress + '-' + playerAddress
}

export function creditRateId(prizePoolAddress: string, tokenAddress: string): string {
  return prizePoolAddress + '-' + tokenAddress
}

export function externalAwardId(prizeStrategyAddress: string, tokenAddress: string): string {
  return prizeStrategyAddress + '-' + tokenAddress
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
  balanceDripId: string,
  playerAddress: string,
): string {
  return balanceDripId + '-' + playerAddress
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
