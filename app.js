const express=require('express');
const socket=require('socket.io')
const http=require('http');
const {Chess}=require('chess.js');
const path = require('path');

const app=express();

const server=http.createServer(app);
const io=socket(server);

const chess= new Chess;
let player={};
let currentPlayer='w';
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

io.on("connection",function(uniquesocket){
    


    if(!player.white){
        player.white=uniquesocket.id;
        uniquesocket.emit('playerRole','w');
        console.log('user conected As White');
    }
    else if(!player.black){
        player.black=uniquesocket.id;
        uniquesocket.emit('playerRole','b');
        console.log('user conected As Black');
    
    }
    else
    {
        player.spectator=uniquesocket.id;
        uniquesocket.emit('playerRole','Spectator');
        console.log('user conected As Spectator');
    }

    uniquesocket.on('move',function(move){
        try {
            if(uniquesocket.id!==player.white && chess.turn()=="w")return;
            if(uniquesocket.id!==player.black && chess.turn()=="b")return;

            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());
                if(chess.isCheckmate()){
                    io.emit('checkmate');
                    chess.reset();
                }
            }
            else{
                // console.log("Invalid Move :",move);
            }
            
        } catch (error) {
            io.emit('invalidMove');
            
        }
        


    })

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id==player.white){
            delete player.white;
        }
        else if(uniquesocket.id==player.black){
            delete player.black;
        }
        console.log('user disconnected');
        chess.reset();
        

    })

})


app.get('/',(req,res)=>{
    res.render('index');
})

server.listen(3000,function(){
    console.log('Server is running on port 3000');
})