import {
    YieldSourcePrizePoolInitialized,
  } from '../generated/templates/YieldSourcePrizePool/YieldSourcePrizePool'
  
  import { loadOrCreateYieldSourcePrizePool } from './helpers/loadOrCreateYieldSourcePrizePool'
  
  export function handleYieldSourcePrizePoolInitialized(event: YieldSourcePrizePoolInitialized): void {
    const _yieldSourcePrizePool = loadOrCreateYieldSourcePrizePool(event.address)
    _yieldSourcePrizePool.yieldSource = event.params.yieldSource
    _yieldSourcePrizePool.save()
  }
  