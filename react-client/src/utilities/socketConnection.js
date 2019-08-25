import io from 'socket.io-client';
let socket = io.connect('http://localhost:8181');

socket.emit('clientAuth', 'alksjd1231')

export default socket;