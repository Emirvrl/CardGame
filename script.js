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

// Avatar seçimi
const avatarPreview = document.getElementById('avatar-preview');
const avatarPanel = document.getElementById('avatar-panel');
const avatarOptions = document.querySelectorAll('.avatar-option');
const avatarList = [
    'images/p1.jpg',
    'images/p2.jpg',
    'images/p3.jpg',
    'images/p4.jpg'
];

// Rastgele avatar seçimi
function getRandomAvatar() {
    return avatarList[Math.floor(Math.random() * avatarList.length)];
}
let selectedAvatar = getRandomAvatar();
avatarPreview.style.backgroundImage = `url('${selectedAvatar}')`;

// Paneldeki avatarları işaretle
avatarOptions.forEach(img => {
    img.classList.remove('selected');
    if (img.getAttribute('data-avatar') === selectedAvatar) {
        img.classList.add('selected');
    }
});

// Avatar önizlemesine tıklayınca panel aç/kapat
avatarPreview.addEventListener('mousedown', function(e) {
    avatarPanel.style.display = avatarPanel.style.display === 'none' || avatarPanel.style.display === '' ? 'flex' : 'none';
    e.stopPropagation();
});

// Panelde avatar seçimi
avatarOptions.forEach(img => {
    img.addEventListener('mousedown', function(e) {
        avatarOptions.forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedAvatar = img.getAttribute('data-avatar');
        avatarPreview.style.backgroundImage = `url('${selectedAvatar}')`;
        avatarPanel.style.display = 'none';
        e.stopPropagation();
    });
});

// Panel dışında bir yere tıklanınca paneli kapat
document.addEventListener('mousedown', function(e) {
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
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
