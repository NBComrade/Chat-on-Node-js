var express = require('express');

var app = express();
var port = 8080;
var users = [];
function getUsers(obj){
	var tmp = [];
	for(var i in obj) tmp.push(obj[i]);
	return tmp.join(', ');	
};
app.set('views', __dirname + '/tpl');
app.set('view engine','jade');
app.engine("jade", require("jade").__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
	response.render('page');	
});

var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function(client){
	client.on('send', function(data){
		io.sockets.emit('message', {message:users[client.id] + ': ' + data.message});
	});
	client.on('hello', function(data){
		client.emit('message', {message:"Welcome to chat " + data.name + '!'});
		client.broadcast.emit('message', {message: '-------- ' + data.name + ' has entered to chat.' + ' --------'});
		if(Object.keys(users).length > 0){
			var userList = getUsers(users);
			client.emit('message', {message: '-------- ' + 'Alredy in chat ' +  userList + ' --------'});
		}else{
			client.emit('message', {message: 'You are alone...'});
		}
		users[client.id] = data.name;
	});
	client.on('disconnect', function(){
		client.broadcast.emit('message', {message: '-------- ' + users[client.id] + ' has left to chat.' + ' --------'});
		delete users[client.id];
	});
})