import { store } from "@graphprotocol/graph-ts"
import { SablierStreamCreated, SablierStreamCancelled, SablierManager } from "../generated/SablierManager/SablierManager"
import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreateSablierStream } from "./helpers/loadOrCreateSablierStream"

export function handleSablierStreamCreated(event: SablierStreamCreated): void {
    const prizePool = loadOrCreatePrizePool(event.params.prizePool)
    prizePool.sablierStreamId = event.params.streamId.toHexString()
    prizePool.save()
}

export function handleSablierStreamCancelled(event: SablierStreamCancelled): void {
    const streamId = loadOrCreateSablierStream(event.params.streamId.toHexString())
    store.remove("SablierStream", streamId)
}

