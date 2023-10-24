// asgino a una constante el tablero,
// el span que señala quien tiene el turno,

const gameBoard = document.querySelector('#gameboard');
const playerDisplay = document.querySelector('#player');
const infoDisplay = document.querySelector('#info-display');

// valores iniciales
let playerGo = 'black'
playerDisplay.textContent = playerGo;

// filas y columnas del tablero
const width = 8;

// de arriba a la izquierda, hacia la derecha y abajo, las piezas y casilleros en blanco
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];


// ------------------------ CREANDO TABLERO --------------------------------

function createBoard(){
    // por cada elemento de startPieces...
    startPieces.forEach( (startPiece,i) =>{
        //creamos un div para los casilleros, con clase square
        const square = document.createElement('div');
        square.classList.add('square');

        // al casillero le meto la pieza (o un null)
        square.innerHTML = startPiece;

        // si el casillero tiene una pieza, le pongo el atributo draggable
        square.firstChild?.setAttribute('draggable',true);

        // cada casillero tendra un atributo numerico para identificarlo,
        // se leen de izquierda a derecha, de arriba a abajo,
        // comienza en el 0 y termina en el 63
        square.setAttribute('square-id',i);

        // identificamos la fila del casillero
        const row = Math.floor((63 - i) / 8) + 1;

        // para filas pares: si el id de casillero es par, sera beige, sino marron
        // para filas impares: si el id de casillero es par, sera marron, sino beige
        if(row % 2 === 0){
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown')
        }else{
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige')
        };

        // si el id de casillero es menor o igual a 15 (2 filas superiores) las piezas seran negras
        // si el id de casillero es mayor o igual a 48 (2 filas inferiores) las piezas seran blancas
        if( i <= 15 ){
            square.firstChild.classList.add('white')
        }else if(i>=48) square.firstChild.classList.add('black');

        // finalmente, agrego el casillero en el gameboard
        gameBoard.append(square);
    });
};

// antes de definir las siguientes funciones, genero el tablero
createBoard();

// -----------------------------------------------------------------------------------





// ---------------------- FUNCIONES DE LAS PIEZAS -------------------------------------------

// asigno a una constante todos los casilleros
// cada casillero tendra su evento dragstart, dragover, drop
const allSquares = document.querySelectorAll('#gameboard .square');
allSquares.forEach( square => {
    square.addEventListener('dragstart',dragStart);
    square.addEventListener('dragover',dragOver);
    square.addEventListener('drop',dragDrop)
});

let startPositionId;
let draggedElement;



// ------ DRAG START -------
function dragStart(e){
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target
}

// ------ DRAG OVER --------
function dragOver(e){
    e.preventDefault()
}

// ------ DRAG AN DROP ----- (funcion extensa)
function dragDrop(e){
    e.stopPropagation();

    // confirmamos que la pieza tomada sea del jugador del turno
    const correctGo = draggedElement.classList.contains(playerGo);
    console.log('correct go',correctGo)

    // confirmamos si el jugador esta posicionando una pieza sobre otra (sin importar color)
    // hay un OR porque a veces el target es la pieza de etiqueta <i>, y otras veces el casillero de la pieza, un <div>
    // el que debe tener la clase es el <div>. Esto lo puedo corregir proximamente
    const taken = e.target.classList.contains('piece') || e.target.parentNode.classList.contains('piece');

    const valid = checkIfValid(e.target) || false;
    console.log('valid',valid)
    // definimos quien es el oponente en el turno actual. Es el contrario al opponentGo
    const opponentGo = playerGo === 'white' ? 'black' : 'white';

    // definimos si el jugador de turno actual, ataco al oponente
    // el OR es por el mismo motivo que el const taken
    const takenByOpponent = e.target.classList.contains(opponentGo) || e.target.parentNode.classList.contains(opponentGo);

    if(correctGo){
        if(takenByOpponent && valid){
            e.target.parentNode.append(draggedElement);
            console.log('e.target',e.target)
            changePlayer();
            return
        }
    }
    if(taken){
        infoDisplay.textContent = 'you cannot go here!';
        setTimeout(()=> infoDisplay.textContent = '', 2000)
    }
    if(valid){
        e.target.append(draggedElement);
        changePlayer();
        return
    }
    //e.target.parentNode.append(draggedElement)
    //e.target.remove()
    //e.target.append(draggedElement)
}


// CHANGE PLAYER
// el proximo jugador en mover sera el contrario al del turno actual
function changePlayer(){
    if(playerGo==='black'){
        reverseIds();
        playerGo = 'white';
        playerDisplay.textContent = 'white'
    }else{
        revertIds();
        playerGo = 'black';
        playerDisplay.textContent = 'black'
    }
}

// cambio ids de casilleros
// los casilleros pasan a contarse del 0 al 63, de derecha a izquierda, de abajo a arriba
function reverseIds(){
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach( (square,i) =>{
        square.setAttribute('square-id', (width*width-1) -i)
    })
};

// cambio ids de casilleros
// los casilleros pasan a contarse del 0 al 63, de izquierda a derecha, de arriba a abajo
// (ids iniciales)
function revertIds(){
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach( (square,i) =>{
        square.setAttribute('square-id', i)
    })
};







// ------------------------ MOVIMIENTOS DE LAS PIEZAS --------------------------------

function checkIfValid(target){
    // obtenemos el id del casillero al que nos movemos y lo convertimos a tipo Number
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    
    switch(piece){
        case 'pawn':
            const starterRow = [8,9,10,11,12,13,14,15];
            if(
                // primer movimiento. El peon puede mover 2 casilleros hacia adelante
                starterRow.includes(startId) && startId + width * 2 === targetId ||
                //movimiento de una casilla de peon
                startId + width === targetId ||
                // movimiento de una casilla en diagonal, atacando pieza rival
                startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`) ||
                startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`)
                
            ){
                console.log('izquierdo',document.querySelector(`[square-id="${startId + width + 1}"]`))
                return true
            }

    }
}