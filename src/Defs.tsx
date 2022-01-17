export interface TrackDef {
    name?: string 
    length?: string
    url: string
    waveform_url?:string
}
export interface PlaylistDef {
    image_url?:string
    archive_url?:string
    name: string
    id:string
    tracks:TrackDef[]
}

export interface InterfaceSpec<T> {
    num:number
    item:T,
    callback:(t:T)=>any
}

export interface TrackComment {
    id:number
    user:string
    start: number
    end?: number
    text: string
}

export function toTimeString(seconds:number) : string {
    const secs = `${(Math.trunc(seconds) % 60)}`.padStart(2,'0')
    const mins = `${Math.trunc(seconds/60)}`.padStart(2,'0')
    return `${mins}:${secs}`
}