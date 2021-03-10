import { SablierStream } from "../../generated/schema"

export function loadOrCreateSablierStream(id : string) : SablierStream{
    let stream = SablierStream.load(id)
    if(!stream){
        stream = new SablierStream(id)
    }
    return stream as SablierStream 
}