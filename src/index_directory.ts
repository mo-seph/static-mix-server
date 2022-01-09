// Running this based on: https://stackoverflow.com/questions/62096269/cant-run-my-node-js-typescript-project-typeerror-err-unknown-file-extension

import {TrackDef, PlaylistDef} from './Defs'

// rather than import, if we use it with node :/
import * as fs from 'fs'
//const fs = require('fs');

const filetypes = ['mp3','wav']


function index_files(root:string) : void {
  console.log("Indexing: ", root)
  const result = processDir("",root)
  //
  const jd = "export const playlists = " + JSON.stringify(result,null,2)
  console.log("Final Result: ",jd)
  fs.writeFile("./src/playlists.js",jd, (f)=>{if(f) console.log(f)})
  fs.writeFile("./public/media/playlists.json",JSON.stringify(result,null,2), (f)=>{if(f) console.log(f)})
}

function processDir(path:string,root:string) : PlaylistDef[] {
  const me = dirToPlaylist(path,root)
  const r = me ? [me] : []
  const child_p = getSubdirs(path,root).map((p) => processDir(p,root))
  // Flatten
  const child_r = ([] as PlaylistDef[]).concat(...child_p)
  return [...r,...child_r]
}

function dirToPlaylist(path:string,root:string): PlaylistDef | null {
  const files =  fs.readdirSync(root+"/"+path).filter(audioFile)
  if( files.length ) {
    const r = {
      basedir:path,
      name:path.replace(/.*\//g,""),
      id:path.replace(/.*\//g,"").replace(/[^a-zA-Z0-9]/g,""),
      tracks: files.map((f)=>fileToItem(f,path,root))
    }
    return r
  }
  return null
}

function fileToItem(filename:string,path:string,root:string) : TrackDef {
  const size = fs.statSync(root+"/"+path+"/"+filename).size
  // Cheekily assume 320k MP3s...
  const length = Math.ceil(size * 8 / 320000)
  const secs = `${(length % 60)}`.padStart(2,'0')
  const mins = `${Math.trunc(length/60)}`.padStart(2,'0')
  return {
    url:path+"/"+filename,
    name:filename.replace(/\.[^.]*$/,""),
    length:`${mins}:${secs}`
  }
}

// Returns the path relative to root of all subdirectories
function getSubdirs(path:string,root:string):string[] {
  return fs.readdirSync(root+"/"+path).map((f)=>path+'/'+f).filter((f:string) => fs.statSync(root + "/" + f).isDirectory())
}

function audioFile(path:string):boolean {
  const path_s = path.toLowerCase()
  for( const f of filetypes ) { 
    if( path_s.endsWith(f)) return true 
    else console.log(`${path_s} does not end with ${f}`)
  }
  return false
}
index_files("./public/media");
