import React, { useEffect, useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Playlist from './PlaylistManager';
import {PlaylistDef,TrackDef} from './Defs'
//import { playlists } from './playlists'
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { MemoryCommentStore } from './Comments';

export const emptyPlaylist:PlaylistDef = {
  name:"No playlist",
  id:"null",
  tracks: [ {name:"No track loaded",url:"./"}]
}

const comments = new MemoryCommentStore()

function App() {
  const [playlists,setPlaylists] = useState([emptyPlaylist])
  useEffect(() => {
    console.log("Loading data")
    fetch("./media/playlists.json")
    .then( response => {
      if( response.ok ) {
        return response.json()
      }
      throw response
    })
    .then( data => {
      console.log("Got data!",data)
      setPlaylists(data)
    })
  },[])
  return (
    <Router>
    <div className="App">
      <Playlist playlists = {playlists as PlaylistDef[]} comments = {comments}/>
    </div>
    </Router>
  );
}

export default App;
