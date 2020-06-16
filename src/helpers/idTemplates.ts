export function prizeId(prizePool: string, currentPrizeId: string): string {
  return prizePool + '-' + currentPrizeId
}

export function playerId(prizePoolAddress: string, playerAddress: string): string {
  return prizePoolAddress + '-' + playerAddress
}
