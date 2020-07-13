import {
  Burned,
  Sent,
  Minted,
  Transfer
} from '../generated/templates/Ticket/ERC777UpgradeSafe'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'

export function handleTransfer(event: Transfer): void {
  // increment or decrement prize pool player count
}

// Burned,
// Sent
// Minted