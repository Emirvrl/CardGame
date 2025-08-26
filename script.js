const socket = io();

// Temel değişkenler (bir kere tanımla)
const avatarPreview = document.getElementById('avatar-preview');
const avatarPanel = document.getElementById('avatar-panel');
const avatarOptions = document.querySelectorAll('.avatar-option');
const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');
const mainMenu = document.getElementById('main-menu');
let selectedAvatar = null;

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

// Sayfa yüklendiğinde rastgele avatar seç
window.addEventListener('load', () => {
    const randomIndex = Math.floor(Math.random() * avatarOptions.length);
    const randomAvatar = avatarOptions[randomIndex].getAttribute('data-avatar');
    avatarPreview.style.backgroundImage = `url('${randomAvatar}')`;
    avatarOptions[randomIndex].classList.add('selected');
});

// Avatar tıklama olayını güncelle
avatarPreview.addEventListener('click', function(e) {
    console.log('Avatar tıklandı!');
    
    // Popup göster
    const popup = document.createElement('div');
    popup.className = 'avatar-popup';
    popup.textContent = 'Avatar Seçim Menüsü';
    document.body.appendChild(popup);
    
    // Panel görünürlüğünü değiştir
    if (avatarPanel.style.display === 'none' || avatarPanel.style.display === '') {
        avatarPanel.style.display = 'block';
    } else {
        avatarPanel.style.display = 'none';
    }

    // 1 saniye sonra popup'ı kaldır
    setTimeout(() => {
        popup.remove();
    }, 1000);

    e.stopPropagation();
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

// Lobi ayarları için değişkenler
const lobbySettings = document.getElementById('lobby-settings');
const lobbyPlayers = document.getElementById('lobby-players');
const gameDuration = document.getElementById('game-duration');
const cardsPerHand = document.getElementById('cards-per-hand');
const rounds = document.getElementById('rounds');
let isHost = false;

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
    isHost = true;
    socket.emit('createLobby', { 
        nickname, 
        avatar,
        settings: {
            duration: gameDuration.value,
            cardsPerHand: cardsPerHand.value,
            rounds: rounds.value
        }
    });
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
    showLobbySettings(true);
});
socket.on('playerJoined', ({ players }) => {
    updatePlayersList(players);
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

// Lobi görüntüleme
function showLobbySettings(isHost) {
    mainMenu.style.display = 'none';
    lobbySettings.style.display = 'block';
    
    // Sadece host ayarları değiştirebilir
    gameDuration.disabled = !isHost;
    cardsPerHand.disabled = !isHost;
    rounds.disabled = !isHost;
}

// Ayar değerleri ve limitleri
const settings = {
    duration: { value: 10, min: 5, max: 30, step: 5 },
    cards: { value: 2, min: 2, max: 6, step: 1 },
    rounds: { value: 5, min: 3, max: 15, step: 2 }
};

// Ayar kontrollerini yönet
document.querySelectorAll('.btn-control').forEach(btn => {
    btn.addEventListener('click', function() {
        if (!isHost) return; // Sadece host değiştirebilir
        
        const action = this.dataset.action;
        const setting = this.closest('.setting-item').querySelector('span').id.split('-')[0];
        const currentSetting = settings[setting];
        
        if (action === 'increase' && currentSetting.value < currentSetting.max) {
            currentSetting.value += currentSetting.step;
        } else if (action === 'decrease' && currentSetting.value > currentSetting.min) {
            currentSetting.value -= currentSetting.step;
        }
        
        // Görüntüyü güncelle
        document.getElementById(`${setting}-display`).textContent = currentSetting.value;
        
        // Sunucuya bildir
        socket.emit('updateSettings', { 
            lobbyId: currentLobbyId, 
            settings: {
                duration: settings.duration.value,
                cards: settings.cards.value,
                rounds: settings.rounds.value
            }
        });
    });
});

// Oyuncu listesini güncelle
function updatePlayersList(players) {
    const playersList = document.getElementById('lobby-players');
    playersList.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${index === 0 ? 'host' : ''}`;
        playerCard.innerHTML = `
            <img src="${player.avatar}" alt="${player.nickname}">
            <div class="player-info">
                <div class="player-name">${player.nickname}</div>
                ${index === 0 ? '<div class="player-status">Lobi Sahibi</div>' : ''}
            </div>
        `;
        playersList.appendChild(playerCard);
    });
}
