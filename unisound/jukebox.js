/*--------------------------------------------*/
/*---> GLOBALS <------------------------------*/
/*--------------------------------------------*/

var PLAY_TIME = 5; // In Seconds

function playQueue(){
	jukebox.play();
	setInterval(function(){
		jukebox.play();
		if(jukebox.songs.length == 0){
			setTimeout(function(){
				$("#stopButton").click();
			}, PLAY_TIME * 1000);
		}
	}, PLAY_TIME * 1000);
}

function removeFromQueue(trackID){
	for(var s = 0; s < jukebox.songs.length; s++){
		if(jukebox.songs[s].getID() == trackID){
			jukebox.songs.splice(s, 1);
		}
	}
	jukebox.update('q');
}

/*
* This function can be passed into a sort function as a comparator when sorting an array of songs
* Ex) var songs = [song1, song2, song3];
*     songs.sort(sortSongsByScores);
*     RESULT: [song2, song3, song1];
*/
function sortSongsByScores(song1, song2){
	return song2.getScore() - song1.getScore();
}

/*--------------------------------------------*/
/*---> JUKEBOX CLASS <------------------------*/
/*--------------------------------------------*/

function Jukebox(name, id, state){
	this.name = name;
	this.id = id;
	this.songs = [];
	this.artist = [];
	this.state = state; //one character to indicate type for update() calls
	readAll()
}

Jukebox.prototype.play = function(){
	previewSong(this.songs[0].preview);
	this.songs.splice(0, 1);
	setTimeout(function(){
		jukebox.update('q');
	}, PLAY_TIME * 1000);
}

Jukebox.prototype.update = function(type){
	if(this.songs.length >= 3){
		for(var l = 0; l < 3; l++){
			this.songs[l].isLocked = true;
		}
	}
	else{
		for(var l = 0; l < this.songs.length; l++){
			this.songs[l].isLocked = true;
		}
	}
	if(this.state == 'q'){
		type = 'q';
	}
	this.sort();
	var rankings = document.getElementById('rankings');
	rankings.innerHTML = this.toHTML(type);
}

Jukebox.prototype.clearForSearch = function(){
	this.songs = [];
	this.artist = [];
}

Jukebox.prototype.sort = function(){
	var locked = [];
	var nonLocked = [];
	for(var s = 0; s < this.songs.length; s++){
		if(this.songs[s].isLocked){
			locked.push(this.songs[s]);
		}
		else{
			nonLocked.push(this.songs[s]);
		}
	}
	nonLocked.sort(function(a, b){
		return sortSongsByScores(a, b);
	});
	this.songs = locked.concat(nonLocked);
}

Jukebox.prototype.updateGenres = function(){
	for(var s = 0; s < this.songs.length; s++){
		if(this.songs[s].getGenre() == 'null'){
			//console.log(this.songs[s].artistID)
			if(this.artistLoaded(this.songs[s].artistID)){
				var artist = this.getArtistById(this.songs[s].artistID);
				this.songs[s].setGenre(artist.genre);
			}
		}
	}
}

/*
* Song song: check jukebox for matches of this song
*/
Jukebox.prototype.addToExistingSong = function(newSong){
	var songExists = false;
	for(var s = 0; s < this.songs.length; s++){
		if(this.songs[s].getID() == newSong.getID()){
			this.songs[s].addUsers([newSong.getUsers()[0]]);
			this.songs[s].calculateScore();
			songExists = true;
		}
	}
	return songExists;
}

Jukebox.prototype.toHTML = function(type){
	var html = "";
	for(var s = 0; s < this.songs.length; s++){
		html += this.songs[s].toHTML(type);
	}
	return html;
}

Jukebox.prototype.toString = function(){
	var string = "";
	for(var s = 0; s < this.songs.length; s++){
		string += this.songs[s] + '<br>';
	}
	return string;
}

/*--------------------------------------------*/
/*---> GETTERS & SETTERS <--------------------*/
/*--------------------------------------------*/

Jukebox.prototype.getSongs = function(){
	return this.songs;
}

/*
* Note that songs is an array of songs, be sure to wrap in [] brackets, even when pushing only a single songs
*/
Jukebox.prototype.addSongs = function(songs){
	for(var s = 0; s < songs.length; s++){
		var songExists = this.addToExistingSong(songs[s]);
		if(!songExists){
			this.songs.push(songs[s]);
		}
	}
}

Jukebox.prototype.getArtists = function(){
	return this.artist;
}

Jukebox.prototype.artistLoaded = function(artistID){
	var loaded = false;
	for(var a = 0; a < this.artist.length; a++){
		if(this.artist[a].id == artistID){
			loaded = true;
		}
	}
	return loaded;
}

Jukebox.prototype.getArtistById = function(artistID){
	var response = null;
	for(var a = 0; a < this.artist.length; a++){
		if(this.artist[a].id == artistID){
			response = this.artist[a];
		}
	}
	return response;
}

/*
* Note that artists is an array of artists, be sure to wrap in [] brackets, even when pushing only a single artists
*/
Jukebox.prototype.addArtists = function(artists){
	for(var a = 0; a < artists.length; a++){
		//var songExists = this.addToExistingSong(artists[a]);
		//TO-DO Create Artist equivalent of this ^
		//if(!songExists){
			this.artist.push(artists[a]);
		//}
	}
}

