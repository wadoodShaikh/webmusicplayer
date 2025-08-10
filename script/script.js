let currentSong = new Audio();
let songs;
let currentFolder;
play.src = "images/pause.svg";

// Fetch songs for a given folder from data.json
async function getSongs(folder) {
  let res = await fetch("songs/data.json");
  let data = await res.json();
  let album = data.albums.find(a => a.folder === folder);
  if (!album) return;

  currentFolder = album.folder;
  songs = album.songs;

  // Populate the left song list
  let songList = document.querySelector(".allSongs ul");
  songList.innerHTML = "";
  songs.forEach(song => {
    songList.innerHTML += `
      <li>
        <div class="songs-card flex-row fs-12">
          <div class="song-details flex-row align-center gap-8">
            <img src="images/music-tune.svg" class="filter-bright h-38" alt="music-tune" />
            <div class="info">${decodeURIComponent(song)}</div>
          </div>
          <div class="play-song-card flex-row align-center gap-8">
            <p>Play</p>
            <img src="images/play-song.svg" class="filter-bright h-22" alt="play-song" />
          </div>
        </div>
      </li>`;
  });

  // Song click listeners
  document.querySelectorAll(".allSongs li").forEach(li => {
    li.addEventListener("click", () => {
      let songName = li.querySelector(".info").innerHTML;
      playMusic(songName);
      play.src = "images/play.svg";
    });
  });
}

// Play selected song
const playMusic = (audio) => {
  currentSong.src = `songs/${currentFolder}/` + audio;
  play.src = "images/pause.svg";
  currentSong.play();
  document.querySelector(".songName").innerHTML = decodeURI(audio);
};

// Display all albums
async function displayAlbums() {
  let res = await fetch("songs/data.json");
  let data = await res.json();
  let playlist = document.getElementById("playlist");

  data.albums.forEach(album => {
    playlist.innerHTML += `
      <div class="playlist-card" data-folder="${album.folder}">
        <img src="${album.cover}" alt="folder-image" />
        <p>${album.title}</p>
      </div>`;
  });

  // Album click listeners
  document.querySelectorAll(".playlist-card").forEach(card => {
    card.addEventListener("click", () => {
      getSongs(card.dataset.folder);
      playMusic(songs[0]);
      play.src = "images/play.svg";
    });
  });
}

async function main() {
  await getSongs("Wadood%20Shaikh");
  displayAlbums();

  // Play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      play.src = "images/play.svg";
      currentSong.play();
    } else {
      play.src = "images/pause.svg";
      currentSong.pause();
    }
  });

  // Previous/next buttons
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`${currentFolder}/`).pop());
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      play.src = "images/play.svg";
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`${currentFolder}/`).pop());
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
      play.src = "images/play.svg";
    }
  });

  // Song time update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".currentTime").innerHTML =
      `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".seekbar-ball").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar
  document.querySelector(".target-seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekbar-ball").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Volume
  document.querySelector(".volume-controls input").addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
  });
}

// Time format helper
function secondsToMinutes(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (isNaN(seconds)) return "00:00";
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

main();
