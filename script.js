const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7269/dashboard", {transport: signalR.HttpTransportType.WebSockets, skipNegotiation: true })
    .build();

connection.start();
console.log(connection.state);
const sharedboard = document.getElementById('shared-board');
const clearButton = document.querySelector('.clear');
const context = sharedboard.getContext('2d');

const offSetX = sharedboard.offsetLeft;
const offSetY = sharedboard.offsetTop;



let isPainting = false;
let lineWidth = 1;
let startX;
let startY;

const clear = () => {
    context.clearRect(0, 0, sharedboard.width, sharedboard.height);
}

clearButton.addEventListener('click', () => {
    clear();
    console.log(connection.state); 
    connection.invoke('Clear');; 
});

connection.on('Clear', () => clear());


const draw = (x, y) => {
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineTo(x - sharedboard.offsetLeft, y - sharedboard.offsetTop);
    context.stroke();
}

connection.on('Draw', (message) => {
    context.beginPath();
    const {x,y} = JSON.parse(message);
    draw(x,y);
});

sharedboard.addEventListener('mousedown', (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
    context.beginPath();
});

sharedboard.addEventListener('mouseup', e => {
    isPainting = false;
    context.stroke();
});

sharedboard.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
    draw(e.clientX, e.clientY);
    connection.invoke('Draw', JSON.stringify({x: e.clientX, y: e.clientY}));
    }
    
});


