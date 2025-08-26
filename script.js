const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');
const socket = io();

function createCards() {
    gameBoard.innerHTML = '';
    const cards = ['A', 'K', 'Q', 'J', '10', '9'];
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.textContent = card;
        gameBoard.appendChild(cardDiv);
    });
}

startBtn.addEventListener('click', createCards);

function randomNick() {
    const names = ["Aslan", "Kartal", "Panter", "Ejder", "Kurt", "Şimşek", "Yıldız"];
    return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
}

const nicknameInput = document.getElementById('nickname');
nicknameInput.addEventListener('blur', () => {
    if (!nicknameInput.value.trim()) {
        nicknameInput.value = randomNick();
    }
});

// Değişken tanımları
const avatarPreview = document.getElementById('avatar-preview');
const avatarPanel = document.getElementById('avatar-panel');
const avatarOptions = document.querySelectorAll('.avatar-option');
let selectedAvatar = null; // Seçili avatar için değişken eklendi

// Sayfa yüklendiğinde rastgele avatar seç
window.addEventListener('load', () => {
    const randomIndex = Math.floor(Math.random() * avatarOptions.length);
    const randomAvatar = avatarOptions[randomIndex].getAttribute('data-avatar');
    avatarPreview.style.backgroundImage = `url('${randomAvatar}')`;
    avatarOptions[randomIndex].classList.add('selected');
});

// Avatar tıklama kodunu güncelle
document.addEventListener('DOMContentLoaded', () => {
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarPanel = document.getElementById('avatar-panel');
    
    console.log('Avatar Preview:', avatarPreview); // Kontrol için
    console.log('Avatar Panel:', avatarPanel); // Kontrol için

    // Tıklama olayını düzelt
    avatarPreview.onclick = function(e) {
        console.log('Avatar tıklandı!'); // Kontrol için
        if (avatarPanel.style.display === 'none' || avatarPanel.style.display === '') {
            avatarPanel.style.display = 'flex';
        } else {
            avatarPanel.style.display = 'none';
        }
        e.stopPropagation();
    };
});

// Avatar seçim olayı
avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', (e) => {
        selectedAvatar = avatar.getAttribute('data-avatar');
        avatarPreview.style.backgroundImage = `url('${selectedAvatar}')`;
        avatarOptions.forEach(a => a.classList.remove('selected'));
        avatar.classList.add('selected');
        avatarPanel.style.display = 'none';
        e.stopPropagation();
    });
});

// Dışarı tıklandığında paneli kapat
document.addEventListener('click', (e) => {
    if (!avatarPreview.contains(e.target) && !avatarPanel.contains(e.target)) {
        avatarPanel.style.display = 'none';
    }
});

// Lobi butonları
const createLobbyBtn = document.getElementById('create-lobby');
const joinLobbyBtn = document.getElementById('join-lobby');
const mainMenu = document.getElementById('main-menu');
const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');

function showGameBoard() {
    mainMenu.style.display = 'none';
    gameBoard.style.display = '';
    startBtn.style.display = '';
    createCards();
}

createLobbyBtn.addEventListener('click', () => {
    createLobbyBtn.classList.add('btn-animate');
    setTimeout(() => createLobbyBtn.classList.remove('btn-animate'), 200);
    const nickname = nicknameInput.value.trim() || randomNick();
    const avatar = selectedAvatar || '';
    socket.emit('createLobby', { nickname, avatar });
});

joinLobbyBtn.addEventListener('click', () => {
    joinLobbyBtn.classList.add('btn-animate');
    setTimeout(() => joinLobbyBtn.classList.remove('btn-animate'), 200);
    const lobbyId = prompt("Lobi kodunu girin:");
    const nickname = nicknameInput.value.trim() || randomNick();
    const avatar = selectedAvatar || '';
    socket.emit('joinLobby', { lobbyId, nickname, avatar });
});

let currentLobbyId = null;

socket.on('lobbyCreated', ({ lobbyId }) => {
    alert(`Lobi oluşturuldu! Kod: ${lobbyId}`);
    currentLobbyId = lobbyId;
    showGameBoard();
});
socket.on('playerJoined', ({ players }) => {
    // Oyuncu listesi güncellenebilir
    console.log('Lobi oyuncuları:', players);
});
socket.on('lobbyError', ({ message }) => {
    alert(message);
});

// Oyunu başlat
startBtn.addEventListener('click', () => {
    if (!currentLobbyId) {
        alert('Lobiye katılmadan oyun başlatılamaz!');
        return;
    }
    socket.emit('startGame', { lobbyId: currentLobbyId });
});

// Kartları göster
socket.on('yourCards', ({ cards }) => {
    gameBoard.innerHTML = '';
    cards.forEach(cardImg => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        const img = document.createElement('img');
        img.src = cardImg;
        img.alt = 'Kart';
        img.className = 'card-img';
        cardDiv.appendChild(img);
        gameBoard.appendChild(cardDiv);
    });
});

socket.on('gameStarted', () => {
    alert('Oyun başladı!');
});

// Buton animasyonu için ek CSS
const style = document.createElement('style');
style.textContent = `
    .btn-animate {
        animation: buttonAnimation 0.2s forwards;
    }

    @keyframes buttonAnimation {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
