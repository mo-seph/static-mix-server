import React, {useState, useEffect, useCallback, useRef, MutableRefObject } from "react"
import './App.css';
import {InterfaceSpec, PlaylistDef, TrackDef} from './Defs'
// @ts-ignore
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
// @ts-ignore
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
// @ts-ignore
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.min";
// @ts-ignore
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";

import { Button, Paper, Card, CardContent, CardActions, CardActionArea, CardHeader, Box,Divider,Typography,Stack } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { CloudDownload, PlayArrow, Pause } from '@mui/icons-material';

const mediaRoot = "/media"

const plugins = [
  {
    plugin: RegionsPlugin,
    options: { dragSelection: true }
  },
  {
    plugin: TimelinePlugin,
    options: {
      container: "#timeline"
    }
  }
  /*
  {
    plugin: CursorPlugin
  }
  */
];

var wavesurfer;


interface PlaylistSetup {
    playlist:PlaylistDef
}

/*
   <div className="tracklist-item">
            <div onClick={act} key={props.num} className="tracklist-item-name">
                {props.item.name || props.item.url}
            </div>
            <div className="tracklist-item-details">
                <a href={mediaRoot + "/" + props.item.url}>D/L</a>&nbsp;&nbsp;
                <span>{props.item.length || "?:?"}</span>
            </div>
        </div>
        */

const TrackListElement = (props:InterfaceSpec<TrackDef>) => {
    return (
        <Card variant='outlined' key={props.num}>
            <CardActionArea onClick={() => props.callback(props.item)}>

            <CardHeader 
                title={<>
                    <Typography variant="subtitle1"><PlayArrow/>{props.item.name || props.item.url}</Typography>
                    </>} 
                action={
                    <div>
                        <div>{props.item.length || "?:?"}</div>
                        <a href={mediaRoot + "/" + props.item.url}><CloudDownload/></a>
                    </div>}
                >
            </CardHeader>
            </CardActionArea>
        </Card>
    )
}

const PlaylistDisplay = (props:any) => {
    const pd = props.playlist as PlaylistDef
    const theme = useTheme()
    return (
        <Card variant='outlined' key={props.num} color={theme.palette.primary.light}> 
            <CardHeader 
                title={<>
                    <Typography variant="h4">{pd.name}</Typography>
                    </>}
                action={
                <div>
                    {pd.archive_url ? <a href={mediaRoot + "/" + pd.archive_url}><CloudDownload/></a> : ""}
                </div>}
                    >
            </CardHeader>
        </Card>
    )
}

const PlaylistElement = (props:InterfaceSpec<PlaylistDef>) => {
    const act = () => {
        console.log("Playlist Selected")
        props.callback(props.item)
    }
    return (
        <div onClick={act} key={props.num} className="playlist-index-item">
            {props.item.name}
        </div>
    )
}

export default (setup:PlaylistSetup) => {
    //const [playlist,setPlaylist] = useState(setup.playlist)
    const [track,setTrack] = useState(
        (setup.playlist && setup.playlist.tracks.length) ? setup.playlist.tracks[0] : {name:"No tracks found",url:"./"})
    
    const [playing,setPlaying] = useState(false)
 
    const regionCreatedHandler = (r:any) => {}

    useEffect( () => {
        console.log("Playlist updated!",setup.playlist)
        setNewTrack(setup.playlist.tracks[0])
    },[setup.playlist])

    const wavesurferRef : MutableRefObject<WaveSurfer> = useRef();
    const handleWSMount = useCallback(
        waveSurfer => {
          wavesurferRef.current = waveSurfer;
          if (wavesurferRef.current) {
            wavesurferRef.current.on("region-created", regionCreatedHandler);
    
            wavesurferRef.current.on("ready", () => {
              console.log("WaveSurfer is ready");
            });
    
            /*
            wavesurferRef.current.on("region-removed", region => {
              console.log("region-removed --> ", region);
            });
            */
    
            wavesurferRef.current.on("loading", (data: any) => {
              console.log("loading --> ", data);
            });
    
            if (window) {
              //window.surferidze = wavesurferRef.current;
            }
          }
        },
        [regionCreatedHandler]
      );
        
    const setNewTrack = useCallback((t:TrackDef) => {
        console.log("Set track!",t)
        //const fn = mediaRoot + "/" + playlist.basedir + "/" + t.url
        const fn = mediaRoot + "/" + t.url
        console.log("Loading track: ",fn)
        const res = wavesurferRef.current.load(fn);
        console.log("Result: ",res)
        setTrack(t)
    }, []);

    const play = useCallback(() => {
        if( playing ) {
            wavesurferRef.current.pause();
            setPlaying(false)
        }
        else {
            wavesurferRef.current.play();
            setPlaying(true)
        }
        //wavesurferRef.current.playPause().then((d:any) => {console.log("playing: ",d)});
    }, [playing]);


    //<Paper className='main-container'></Paper>
        //<div className="tracklist-container">
    /*  <Box height={400} sx={{
            overflow:"scroll",
            textAlign:"left"
            }}>
            {setup.playlist.tracks.map((t,i) => (
                <TrackListElement item={t} callback={setNewTrack} num={i} />
            )) }
        </Box>*/
    return (
    <Box>
        <PlaylistDisplay playlist={setup.playlist}/>
        <Box height={400} sx={{
            overflow:"scroll",
            textAlign:"left"
            }}>
            {setup.playlist.tracks.map((t,i) => (
                <TrackListElement item={t} callback={setNewTrack} num={i} />
            )) }
        </Box>
        <Divider>.</Divider>
        <Paper elevation={3}>
            <div className="waveform-buttons">
                <button onClick={play} className="waveform-button">{playing ? <Pause/>: <PlayArrow/>}</button>
            </div>   
            <div className="waveform-title">{track.name}</div>
            <div className="clear"></div>
            <div className="waveform-container">
            
                <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform">
                </WaveForm>
                <div id="timeline" />
            
                </WaveSurfer>
        
            </div>
        </Paper>
    </Box>
    );
}