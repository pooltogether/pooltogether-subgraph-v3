
import {
  PrizePoolCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'


export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  loadOrCreateCompoundPrizePool(
    event.params.prizePool
  )
}
