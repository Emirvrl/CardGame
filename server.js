const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const lobbies = {};

const CARD_IMAGES = [
    'images/1.png',
    'images/2.png',
    'images/3.png',
    'images/4.png',
    'images/5.png',
    'images/6.png'
];

io.on('connection', (socket) => {

    socket.on('createLobby', ({ nickname, avatar, settings }) => {
        const lobbyId = Math.random().toString(36).substr(2, 6);
        lobbies[lobbyId] = {
            players: [{ id: socket.id, nickname, avatar }],
            settings: settings || { duration: 10, cards: 2, rounds: 5 }
        };
        socket.join(lobbyId);
        socket.emit('lobbyCreated', { lobbyId, settings: lobbies[lobbyId].settings });
        io.to(lobbyId).emit('playerJoined', { players: lobbies[lobbyId].players, settings: lobbies[lobbyId].settings });
    });

    // joinLobby: katilan oyuncuya da mevcut ayarlari ver
    socket.on('joinLobby', ({ lobbyId, nickname, avatar }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return socket.emit('lobbyError', { message: 'Lobi bulunamadi.' });

        if (lobby.players.length >= 4) {
            return socket.emit('lobbyError', { message: 'Lobi dolu (max 4 oyuncu).' });
        }

        lobby.players.push({ id: socket.id, nickname, avatar });
        socket.join(lobbyId);

        // tum odaya oyuncu listesi ve ayarlar
        io.to(lobbyId).emit('playerJoined', { players: lobby.players, settings: lobby.settings });

        // yeni katilana lobi kodunu ayrica bildir (istenirse)
        socket.emit('lobbyInfo', { lobbyId, settings: lobby.settings });
    });

    // host ayarlari degistirdiginde lobby'ye yayinla
    socket.on('updateSettings', ({ lobbyId, settings }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;
        lobby.settings = { ...lobby.settings, ...settings };
        io.to(lobbyId).emit('settingsUpdated', lobby.settings);
    });

    socket.on('startGame', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) {
            socket.emit('lobbyError', { message: 'Lobi bulunamadı.' });
            return;
        }
        if (lobby.players.length < 2) {
            socket.emit('lobbyError', { message: 'Oyunu başlatmak için en az 2 oyuncu olmalı.' });
            return;
        }
        // Kartları rastgele dağıt
        const shuffled = [...CARD_IMAGES].sort(() => Math.random() - 0.5);
        lobby.players.forEach((player, idx) => {
            // Her oyuncuya 2 kart ver
            const cards = shuffled.slice(idx * 2, idx * 2 + 2);
            io.to(player.id).emit('yourCards', { cards });
        });
        io.to(lobbyId).emit('gameStarted');
    });

    socket.on('disconnect', () => {
        for (const lobbyId in lobbies) {
            lobbies[lobbyId].players = lobbies[lobbyId].players.filter(p => p.id !== socket.id);
            if (lobbies[lobbyId].players.length === 0) {
                delete lobbies[lobbyId];
            }
        }
    });
});

// Hata yakalama
io.on('connect_error', (error) => {
    console.error('Socket.IO bağlantı hatası:', error);
});

// Express hata yakalama
app.use((err, req, res, next) => {
    console.error('Express hatası:', err);
    res.status(500).send('Sunucu hatası');
});

// Express static middleware'i başa alındı
app.use(express.static(__dirname));

const PORT = 3001;

// Sunucuyu başlat
try {
    server.listen(PORT, '0.0.0.0', () => {
        console.log('✅ Sunucu başlatıldı');
        console.log(`📡 http://localhost:${PORT} adresinde çalışıyor`);
        console.log('⌛ Bağlantılar bekleniyor...');
    });
} catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error);
    process.exit(1);
}

// Ctrl+C ile güvenli kapatma
process.on('SIGINT', () => {
    console.log('\n🛑 Sunucu kapatılıyor...');
    server.close(() => {
        console.log('👋 Sunucu güvenli bir şekilde kapatıldı');
        process.exit(0);
    });
});
