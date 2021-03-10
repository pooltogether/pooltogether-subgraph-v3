import { store } from "@graphprotocol/graph-ts"
import { SablierStreamCreated, SablierStreamCancelled, SablierManager } from "../generated/SablierManager/SablierManager"
import { loadOrCreateSablierStream } from "./helpers/loadOrCreateSablierStream"

export function handleSablierStreamCreated(event: SablierStreamCreated): void {
    const stream = loadOrCreateSablierStream(event.params.streamId.toHexString())
    stream.prizePool = event.params.prizePool.toHexString()
    stream.save()
    // const prizePool = loadOrCreatePrizePool(event.params.prizePool)
    // prizePool.sablierStreamId = streamId
    // prizePool.save()
}

export function handleSablierStreamCancelled(event: SablierStreamCancelled): void {
    const stream = loadOrCreateSablierStream(event.params.streamId.toHexString())
    store.remove("SablierStream", stream.id)
}

