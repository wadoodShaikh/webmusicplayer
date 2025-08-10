// Keep the initial control button as pause
let currentSong = new Audio();
let songs;
let currentFolder;
play.src = "images/pause.svg";

// Function to get songs from the songs folder
async function getSongs(folder) {
  currentFolder = folder;
  let data = await fetch(`https://github.com/wadoodShaikh/webmusicplayer/tree/main/${folder}`);
  let response = await data.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let listA = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < listA.length; index++) {
    const element = listA[index];
    if (element.href.endsWith(".mp3")) {
      // songs.push(element.href.split("/Wadood%20Shaikh/")[1].split(".mp3")[0]);
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // list out all the songs in the left section
  let songList = document
    .querySelector(".allSongs")
    .getElementsByTagName("ul")[0];
  songList.innerHTML = " ";
  for (const song of songs) {
    songList.innerHTML =
      songList.innerHTML +
      `  <li >
                <div class="songs-card  flex-row fs-12">
                  <div class="song-details flex-row align-center gap-8">
                    <img
                      src="images/music-tune.svg"
                      class="filter-bright h-38"
                      alt="music-tune"
                    />
                    <div class="info">${decodeURIComponent(song)}</div>
                  </div>
                  <div class="play-song-card flex-row align-center gap-8">
                    <p>Play</p>
                    <img
                      src="images/play-song.svg"
                      class="filter-bright h-22"
                      alt="play-song"
                    />
                  
                </div></div>
              </li>`;
  }

  // Attach event listener to all the li - list of songs in the left section
  Array.from(
    document.querySelector(".allSongs").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").innerHTML);
      playMusic(e.querySelector(".info").innerHTML);
      play.src = "images/play.svg";
    });
  });

  return songs;
}

//function to convert total seconds into minutes:seconds format
function secondsToMinutes(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (isNaN(seconds)) {
    return "00:00";
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

//function to play the music
const playMusic = (audio) => {
  currentSong.src = `songs/${currentFolder}/` + audio;

  // Keep the control button as play whenever you start a new music
  play.src = "/images/pause.svg";
  currentSong.play();
  document.querySelector(".songName").innerHTML = decodeURI(audio);
};

async function displayAlbums() {
  let data = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await data.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let playlist = document.getElementById("playlist");
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      // Get the metadata of the folder (title)
      let data = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await data.json();
      playlist.innerHTML =
        playlist.innerHTML +
        `
       <div class="playlist-card" data-folder="${folder}">
                <img src="/songs/${folder}/cover.jpeg" alt="folder-image" />
                <p>${response.title}</p>
              </div>`;
    }
  }

  // Dynamic folder onclick
  Array.from(document.getElementsByClassName("playlist-card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      play.src = "images/play.svg";
    });
  });
}

// main function
async function main() {
  // Get all the songs
  await getSongs("Wadood%20Shaikh");
  // playMusic(songs[0]);

  displayAlbums();

  // Attach event listener to the previous play and next control buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      play.src = "images/play.svg";
      currentSong.play();
    } else {
      play.src = "images/pause.svg";
      currentSong.pause();
    }
  });
  // Event listener for the previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`${currentFolder}/`).slice(-1)[0]
    );
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      play.src = "images/play.svg";
    }
  });
  // Event Listener for the next button
  next.addEventListener("click", () => {
    // currentSong.pause();
    let index = songs.indexOf(
      currentSong.src.split(`${currentFolder}/`).slice(-1)[0]
    );
    if (index + 1 < songs.length - 0) {
      playMusic(songs[index + 1]);
      play.src = "images/play.svg";
    }
  });

  //Update the time duration of the song
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".currentTime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )} / ${secondsToMinutes(currentSong.duration)}`;

    //Start the seeker ball
    document.querySelector(".seekbar-ball").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add Event listener for the seekbar
  document.querySelector(".target-seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekbar-ball").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add working volume button and range
  document
    .querySelector(".volume-controls")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = e.target.value / 100;
    });
}

main();

burger.addEventListener("click", (e) => {
  document.querySelector(".left-section").classList.toggle("left-section-toggle");
});



const desktopQuery = window.matchMedia("(max-width: 427px)");

function runOnDesktop(e) {
  if (e.matches) {
    document.querySelector(".time-duration").style = "display:none;"
  }
}

runOnDesktop(desktopQuery);
desktopQuery.addEventListener("change", runOnDesktop);





