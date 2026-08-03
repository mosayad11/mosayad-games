import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ==========================
// Elements
// ==========================

const gamesContainer = document.getElementById("games-container");
const searchInput = document.getElementById("search");

const clickSound = document.getElementById("click-sound");
const hoverSound = document.getElementById("hover-sound");
const soundBtn = document.getElementById("sound-btn");

let soundEnabled = true;

clickSound.volume = 0.3;
hoverSound.volume = 0.15;


let games = [];

async function increaseDownloads(gameId) {

    try {

        const gameRef = doc(db, "games", gameId);

        await updateDoc(gameRef, {

            downloads: increment(1)

        });

    }

    catch (error) {

        console.error(error);

    }

}

function playClick() {

    if (!soundEnabled) return;

    clickSound.currentTime = 0;
    clickSound.play();

}


function setupSounds() {

    document.querySelectorAll("button, a").forEach(element => {

        element.removeEventListener("mouseenter", playHover);
        element.removeEventListener("click", playClick);

        element.addEventListener("mouseenter", playHover);
        element.addEventListener("click", playClick);

    });

    document.querySelectorAll(".download").forEach(button => {

        button.onclick = async (e) => {

            if (
                isMobile() &&
                button.dataset.platform === "Windows"
            ) {

                const ok = confirm(
                    "⚠️ This game is for PC.\n\nIt may not run on your device.\n\nDo you want to continue?"
                );

                if (!ok) {

                    e.preventDefault();
                    return;

                }

            }

            await increaseDownloads(button.dataset.id);

            window.location.href = button.href;

        };

    });

}

function playHover() {

    if (!soundEnabled) return;

    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => {});

}

function isMobile() {

    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

}

// ==========================
// Load Games
// ==========================

async function loadGames() {

    try {

        const response = await fetch("js/games.json");

        games = await response.json();
        const snapshot = await getDocs(collection(db, "games"));

        const firebaseGames = {};

        snapshot.forEach(doc => {

            firebaseGames[doc.id] = doc.data();

        });

        games.forEach(game => {

            if (firebaseGames[game.id]) {

                game.downloads = firebaseGames[game.id].downloads;
                game.likes = firebaseGames[game.id].likes;

            } else {

                game.downloads = 0;
                game.likes = 0;

            }

        });

        displayGames(games);

    }

    catch (error) {

        gamesContainer.innerHTML = `
            <h2 style="text-align:center;">
                Failed to load games.
            </h2>
        `;

        console.error(error);

    }

}


// ==========================
// Display Games
// ==========================

function displayGames(list) {

    gamesContainer.innerHTML = "";

    if (list.length === 0) {

        gamesContainer.innerHTML = `
            <h2 style="text-align:center;">
                No games found.
            </h2>
        `;

        return;

    }

    list.forEach(game => {

        gamesContainer.innerHTML += `

        <div class="game-card">

            <img src="${game.image}" alt="${game.name}">

            <h2>${game.name}</h2>

            <p>${game.description}</p>

            <div class="game-info">

                <span>Version ${game.version}</span>

                <span>${game.size}</span>

            </div>

            <div class="platform">
                <span>💻 ${game.platform}</span>
            </div>

            <p class="downloads">
                <span>⬇️ ${game.downloads} Downloads</span>
            </p>

            <div class="buttons">

                <a
                    class="download"
                    href="${game.download}"
                    data-platform="${game.platform}"
                    data-id="${game.id}"
                    download>

                    Download

                </a>

            </div>

        </div>

        `;

    });
    setupSounds();

}


// ==========================
// Search
// ==========================

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    const filteredGames = games.filter(game =>

        game.name.toLowerCase().includes(value) ||

        game.description.toLowerCase().includes(value)

    );

    displayGames(filteredGames);

});

// ==========================
// Theme
// ==========================

const themeBtn = document.getElementById("theme-btn");

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="light"){

    document.body.classList.add("light-theme");

    themeBtn.textContent="🌙";

}

else{

    themeBtn.textContent="☀️";

}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light-theme");

    if(document.body.classList.contains("light-theme")){

        localStorage.setItem("theme","light");

        themeBtn.textContent="🌙";

    }

    else{

        localStorage.setItem("theme","dark");

        themeBtn.textContent="☀️";

    }

});
window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    loader.classList.add("hide");

});


soundBtn.addEventListener("click", () => {

    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }

    soundEnabled = !soundEnabled;

    soundBtn.textContent = soundEnabled ? "🔊" : "🔇";

});
// ==========================
// Start
// ==========================

loadGames();