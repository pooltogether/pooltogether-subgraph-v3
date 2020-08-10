export function prizeId(prizePool: string, currentPrizeId: string): string {
  return prizePool + '-' + currentPrizeId
}

export function playerId(prizePoolAddress: string, playerAddress: string): string {
  return prizePoolAddress + '-' + playerAddress
}

export function balanceDripId(
  comptrollerAddress: string,
  prizeStrategyAddress: string,
  measureTokenAddress: string,
  dripTokenAddress: string
): string {
  return `${comptrollerAddress}-${prizeStrategyAddress}-${measureTokenAddress}-${dripTokenAddress}`;
}

export function playerBalanceDripId(
  comptrollerAddress: string,
  prizeStrategyAddress: string,
  playerAddress: string
): string {
  return `${comptrollerAddress}-${prizeStrategyAddress}-${playerAddress}`;
}

export function volumeDripId(
  comptrollerAddress: string,
  prizeStrategyAddress: string,
  volumeDripIndex: string
): string {
  return `${comptrollerAddress}-${prizeStrategyAddress}-${volumeDripIndex}`;
}
