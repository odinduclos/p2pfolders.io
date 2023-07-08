var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var Deck = require('./server/deck.js');
var Player = require('./server/player.js');
var Game = require('./server/game.js');

var games = {};
io.on('connection', function(socket){
	console.log('a user connected', socket.client.id);
	socket.emit('updateRooms', games);
	var player = new Player(socket.client.id);
	var game = false;
	socket.on('createRoom', function (infos) {
		console.log("create", infos.room);
		games[infos.room] = new Game(infos.name || infos.room, new Deck(), player);
		game = games[infos.room];
		player.room = infos.room;
		socket.join('room-' + socket.client.id);
		player.addCards(game.deck.draw(7));
	});
	socket.on('joinRoom', function (id) {
		console.log("join", id);
		game = games[id];
		game.addPlayer(player);
		socket.join('room-' + id);
		player.room = id;
		player.addCards(game.deck.draw(7));
	});
	socket.on('launchGame', function () {
		var cards = game.deck.draw(1);
		if (cards) {
			io.to('room-' + player.room).emit('updateGame', game.addCard(cards[0]));
			console.log('send', player.cards);
			socket.emit('updateHand', player.cards);
		}
		delete (games[player.id]);
	});
	socket.on('play', function (data) {
		var position = data.position;
		var color = data.color;
		if (player != game.players[game.turn]) {
			socket.emit('displayError', {error: 403, message: 'It is not your turn.'});
			return false;
		}
		if (typeof (player.cards[position]) == 'undefined') {
			console.log('player.cards', player.cards);
			console.log('position', position);
			socket.emit('displayError', {error: 403, message: 'This card is not in your hand.'});
			return false;
		}
		var card = player.cards[position];
		if (card.color == 'black' && typeof (color) == 'undefined') {
			socket.emit('displayError', {error: 403, message: 'You have to choose a color.'});
			return false;
		}
		if (card.color != 'black' && card.color != game.color && card.number != game.stack[game.stack.length - 1].number) {
			socket.emit('displayError', {error: 403, message: 'You cannot play this card.'});
			return false;
		}
		if (player.removeCard(position).length == 0) {
			io.to('room-' + player.room).emit('endGame', player);
			return false;
		}
		game.addCard(card);
		if (card.color == 'black') {
			game.color = color;
		}
		io.to('room-' + player.room).emit('updateGame', card);
		if (card.function == 'skip') {
			game.nextTurn();
		}
		if (card.function == 'reverse') {
			game.reverse = !game.reverse;
		}
		game.nextTurn();
		if (card.function == 'draw2') {
			game.players[game.turn].addCards(game.deck.draw(2));
		}
		if (card.function == 'draw4') {
			game.players[game.turn].addCards(game.deck.draw(4));
		}
		if (player.cards.length == 1) {
			console.log('UNOOOOOOOOOO');
			io.to('room-' + player.room).emit('displayError', {error: 418, message: player.id + ' say UNO!'});
		}
		socket.emit('updateHand', player.cards);
		io.to('/#' + game.players[game.turn].id).emit('updateHand', game.players[game.turn].cards);
	});
	socket.on('draw', function () {
		if (player != game.players[game.turn]) {
			socket.emit('displayError', {error: 403, message: 'It is not your turn.'});
			return false;
		}
		player.addCards(game.deck.draw(1));
		socket.emit('updateHand', player.cards);
		game.nextTurn();
	});
/*	socket.on('endTurn', function () {
		game.nextTurn();
		io.to('/#' + game.players[game.turn].id).emit('updateHand', game.players[game.turn].cards);
	});*/
	socket.on('disconnect', function(){
		delete (games[player.id]);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});