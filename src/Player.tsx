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

import { Button, Paper, Card, CardContent, CardActions, CardActionArea, CardHeader, Box,Divider,Typography,Stack,Avatar, Grid, List, ListItem, ListItemAvatar, ListItemText, ListItemButton } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { Download, PlayArrow, Pause, RssFeedTwoTone } from '@mui/icons-material';

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

export interface TracklistDisplaySpec {
    playlist:PlaylistDef
    callback:(t:TrackDef)=>any
}
const TrackListDisplay = (props:TracklistDisplaySpec) => {
 
    return (
    <List dense={true} disablePadding={true} sx={{ width: '100%', height:400, bgcolor: 'background.paper', overflow:"scroll", }}>
        {props.playlist.tracks.map((track,num) => (<>
            <ListItem disablePadding={true} secondaryAction={<a href={mediaRoot + "/" + track.url}><Download color='primary'/></a>} >
                <ListItemButton>
                <ListItemAvatar onClick={() => props.callback(track)}><PlayArrow color='primary'/></ListItemAvatar>
                <ListItemText
                    onClick={() => props.callback(track)}
                    primary={track.name || track.url}
                    secondary={track.length || "?:?"}
                />
                </ListItemButton>
            </ListItem>
        </>)) }
    </List>
    )
  
}

const PlaylistDisplay = (props:any) => {
    const pd = props.playlist as PlaylistDef
    const theme = useTheme()
    return (
        <Card key={props.num} color={theme.palette.primary.light}> 
            <CardHeader 
                title={<>
                    <Typography variant="h4" color="primary" align="left">{pd.name}</Typography>
                    {pd.image_url ? <Avatar src={mediaRoot + "/" +pd.image_url} variant="rounded" sx={{ width: 200, height: 200 }}/> : ""}
                    </>}
                action={
                <div>
                    {pd.archive_url ? <a href={mediaRoot + "/" + pd.archive_url}><Download color='secondary'/></a> : <Download color='disabled'/>}
                </div>}
                    >
            </CardHeader>
        </Card>
    )
}


export default (setup:PlaylistSetup) => {
    //const [playlist,setPlaylist] = useState(setup.playlist)
    const [track,setTrack] = useState(
        (setup.playlist && setup.playlist.tracks.length) ? setup.playlist.tracks[0] : {name:"No tracks found",url:"./"})
    
    const [playing,setPlaying] = useState(false)
 
    const regionCreatedHandler = (r:any) => {}
    const theme = useTheme()

    useEffect( () => {
        console.log("Playlist updated!",setup.playlist)
        setNewTrack(setup.playlist.tracks[0])
    },[setup.playlist])

    const isPlaying = useCallback(() => {
        console.log("Checking play status:",playing);
        return playing
    },[playing])

    const wavesurferRef : MutableRefObject<WaveSurfer> = useRef();
    const handleWSMount = useCallback(
        waveSurfer => {
          wavesurferRef.current = waveSurfer;
          if (wavesurferRef.current) {
            wavesurferRef.current.on("region-created", regionCreatedHandler);
    
            wavesurferRef.current.on("ready", () => {
              console.log("WaveSurfer is ready");
              if( isPlaying() ) {
                  console.log("Ready to play, and playing, so will start")
                  wavesurferRef.current.play()
              } else {
                  console.log("Ready to play but not playing")
              }
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
        wavesurferRef.current.load(fn);
        setTrack(t)
    }, []);

    const play = useCallback(() => {
        if( playing ) {
            console.log("Setting playing to false")
            wavesurferRef.current.pause();
            setPlaying(false)
        }
        else {
            wavesurferRef.current.play();
            console.log("Setting playing to true")
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
    <Grid container spacing={2}>
        <Grid item xs={4}>
            <PlaylistDisplay playlist={setup.playlist}/>
        </Grid>
        <Grid item xs={8}>
            <TrackListDisplay playlist={setup.playlist} callback={setNewTrack}  />
        </Grid>
        <Grid item xs={12}>
        <Paper elevation={3}>
            <div className="waveform-buttons">
                <button onClick={play} className="waveform-button">{playing ? <Pause color='secondary'/>: <PlayArrow color='secondary'/>}</button>
            </div>   
            <div className="waveform-title">
                <Typography variant="h6" color="primary" align="left">{track.name}</Typography>
            </div>
            <div className="clear"></div>
            <div className="waveform-container">
            
                <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform" 
                    backgroundColor="#eee"
                    progressColor={theme.palette.warning.dark}
                    cursorColor={theme.palette.warning.dark}
                    waveColor={theme.palette.primary.dark}>
                </WaveForm>
                <div id="timeline" style={{background: "#eee"}}/>
            
                </WaveSurfer>
        
            </div>
        </Paper>
        </Grid>
    </Grid>
    );
}