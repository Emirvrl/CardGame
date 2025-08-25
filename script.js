const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');

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

// Avatar önizleme
const avatarInput = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatar-preview');
avatarInput.addEventListener('change', function() {
    const file = avatarInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(file);
    } else {
        avatarPreview.style.backgroundImage = '';
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
    showGameBoard();
});
joinLobbyBtn.addEventListener('click', () => {
    joinLobbyBtn.classList.add('btn-animate');
    setTimeout(() => joinLobbyBtn.classList.remove('btn-animate'), 200);
    showGameBoard();
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
