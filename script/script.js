// Keep the initial control button as pause
let currentSong = new Audio();
let songs;
let currentFolder;

// Use explicit element refs (safer than relying on implicit globals)
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const burger = document.getElementById("burger");

// initial icon (relative path)
if (play) play.src = "images/pause.svg";

/**
 * getSongs(folder)
 * - Loads album info from songs/data.json (GitHub Pages safe)
 * - Populates the left song list exactly like your original code
 */
async function getSongs(folder) {
  try {
    // load the JSON that contains album metadata (folder names + song lists)
    const res = await fetch("songs/data.json");
    const db = await res.json();
    const album = db.albums.find((a) => a.folder === folder);
    if (!album) {
      console.warn("Album not found in data.json:", folder);
      songs = [];
      currentFolder = folder;
      document.querySelector(".allSongs ul").innerHTML = "";
      return songs;
    }

    currentFolder = album.folder;
    songs = album.songs.slice(); // copy

    // render song list (keeps structure similar to your original)
    const songList = document.querySelector(".allSongs").getElementsByTagName("ul")[0];
    songList.innerHTML = " ";
    for (const song of songs) {
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
    }

    // Attach click listeners exactly as before
    Array.from(document.querySelector(".allSongs").getElementsByTagName("li")).forEach((e) => {
      e.addEventListener("click", () => {
        const songName = e.querySelector(".info").innerHTML;
        playMusic(songName);
        if (play) play.src = "images/play.svg";
      });
    });

    return songs;
  } catch (err) {
    console.error("getSongs error:", err);
    return [];
  }
}

/** secondsToMinutes (unchanged) */
function secondsToMinutes(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (isNaN(seconds)) return "00:00";
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** playMusic (keeps your original behavior, only uses relative paths) */
const playMusic = (audio) => {
  if (!currentFolder) {
    console.warn("playMusic called but currentFolder is empty.");
    return;
  }
  currentSong.src = `songs/${currentFolder}/` + audio;
  if (play) play.src = "images/pause.svg";
  currentSong.play().catch((e) => {
    // some browsers block autoplay; this makes failures visible
    console.warn("play() failed:", e);
  });
  const nameEl = document.querySelector(".songName");
  if (nameEl) nameEl.innerHTML = decodeURI(audio);
};

/** displayAlbums: read songs/data.json and render playlist cards (same style as yours) */
async function displayAlbums() {
  try {
    const res = await fetch("songs/data.json");
    const db = await res.json();
    const playlist = document.getElementById("playlist");
    playlist.innerHTML = ""; // clear

    db.albums.forEach((album) => {
      playlist.innerHTML += `
        <div class="playlist-card" data-folder="${album.folder}">
          <img src="${album.cover}" alt="folder-image" />
          <p>${album.title}</p>
        </div>`;
    });

    // attach click listeners similar to your original code
    Array.from(document.getElementsByClassName("playlist-card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        // getSongs and then play first track (keeps original flow)
        await getSongs(`${item.currentTarget.dataset.folder}`);
        if (songs && songs.length > 0) {
          playMusic(songs[0]);
          if (play) play.src = "images/play.svg";
        }
      });
    });
  } catch (err) {
    console.error("displayAlbums error:", err);
  }
}

/** main() - preserves your exact structure and handlers but uses data.json */
async function main() {
  // default initial album (same as your original)
  await getSongs("Wadood%20Shaikh");
  // don't auto-play here unless you want to
  displayAlbums();

  // play/pause (same logic)
  if (play) {
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        play.src = "images/play.svg";
        currentSong.play();
      } else {
        play.src = "images/pause.svg";
        currentSong.pause();
      }
    });
  }

  // previous button (same logic, using currentFolder)
  if (previous) {
    previous.addEventListener("click", () => {
      const currentFileName = currentSong.src.split(`${currentFolder}/`).pop();
      const index = songs.indexOf(currentFileName);
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
        if (play) play.src = "images/play.svg";
      }
    });
  }

  // next button
  if (next) {
    next.addEventListener("click", () => {
      const currentFileName = currentSong.src.split(`${currentFolder}/`).pop();
      const index = songs.indexOf(currentFileName);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
        if (play) play.src = "images/play.svg";
      }
    });
  }

  // timeupdate handler (unchanged)
  currentSong.addEventListener("timeupdate", () => {
    const ct = document.querySelector(".currentTime");
    if (ct) ct.innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;

    const ball = document.querySelector(".seekbar-ball");
    if (ball && currentSong.duration) {
      ball.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
  });

  // seekbar click (unchanged)
  const seek = document.querySelector(".target-seekbar");
  if (seek) {
    seek.addEventListener("click", (e) => {
      let targetWidth = e.target.getBoundingClientRect().width;
      let percent = (e.offsetX / targetWidth) * 100;
      const ball = document.querySelector(".seekbar-ball");
      if (ball) ball.style.left = percent + "%";
      if (currentSong.duration) currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
  }

  // volume control (unchanged)
  const volInput = document.querySelector(".volume-controls input");
  if (volInput) {
    volInput.addEventListener("change", (e) => {
      currentSong.volume = e.target.value / 100;
    });
  }
}

/* start */
main();

/* burger toggle (keeps your original one-liner style) */
if (burger) {
  burger.addEventListener("click", (e) => {
    document.querySelector(".left-section").classList.toggle("left-section-toggle");
  });
}

/* -------------------------
   media-query style toggling
   (adds/removes a <style> element when matched)
   ------------------------- */
const mq = window.matchMedia("(max-width: 427px)");
const mqStyleId = "mq-time-duration-style";

function applyMobileStyle(e) {
  let existing = document.getElementById(mqStyleId);
  if (e.matches) {
    // add style element to hide time-duration (like you wanted)
    if (!existing) {
      const style = document.createElement("style");
      style.id = mqStyleId;
      style.innerHTML = `.time-duration { display: none !important; }`;
      document.head.appendChild(style);
    }
  } else {
    // remove it when not matched
    if (existing) existing.remove();
  }
}
applyMobileStyle(mq);
mq.addEventListener("change", applyMobileStyle);
