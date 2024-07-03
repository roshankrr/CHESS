const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const rotate=()=>{
    if(playerRole==="b"){
        boardElement.style.rotate='180deg';
        const dibba = document.querySelectorAll('.square');
        dibba.forEach((dibba)=>{
            dibba.style.transform='rotate(180deg)';
        });
    }
}

socket.on('playerRole', function (role) {
    playerRole = role;
    renderBoard();
    rotate();

});

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const square = document.createElement('div');
            square.classList.add('square');
            if ((rowIndex + colIndex) % 2 === 1) {
                square.classList.add('bg-cyan-500');
            }

            boardElement.appendChild(square);
            square.dataset.row = rowIndex;
            square.dataset.col = colIndex;
            
            if (col!=null) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    col.color === 'w' ? 'white' : 'black'
                );
                pieceElement.innerText = getPieceUniqcode(col);
                // console.log(col.color)
                pieceElement.draggable = playerRole === col.color;

                pieceElement.addEventListener('dragstart', (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        pieceElement.classList.add("piece.draggable")
                        sourceSquare = { row: rowIndex, col: colIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener('dragend', (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                square.appendChild(pieceElement);
            }

            square.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            square.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(square.dataset.row),
                        col: parseInt(square.dataset.col)
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });
        });
    });
}

const handleMove = (source,target) => {
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}` ,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`  ,
        promotion: "q"
    };
    socket.emit("move",move);
    socket.on('invalidMove',()=>{
        const invalidMove=document.querySelector('.movevalid')
        invalidMove.innerText="Invalid Move";
        setTimeout(()=>{
            invalidMove.innerText="";
        },2000)
    })
}

const getPieceUniqcode = (piece) => {
    const pieceUniqcodeWhite = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
    };
    const pieceUniqcodeBlack = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
    };
    if (piece.color === "w") {
        return pieceUniqcodeWhite[piece.type];
    } else if (piece.color === "b") {
        return pieceUniqcodeBlack[piece.type];
    } else {
        return "";
    }
}





socket.on('spectator',function(){
    playerRole=null;
    renderBoard();
    rotate();
})

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
    rotate();
})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
    rotate();
})

socket.on("checkmate",function(){
    alert("GameOver!!");
})


renderBoard();