var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


const scaleX = 2000 / 40;
const scaleY = 2000 / 40;

var usuarios = []

var mapas = []
var mapas_design = []

// conección de usuario
io.on('connection', (socket) => {
  socket.usuario = {}

    // **********************************************************************************
    // USUARIOS
    // **********************************************************************************
    socket.on('registrar_usuario', (msg) => {
        // console.log('Usuario: '+msg)
        socket.usuario = msg
        usuarios[msg] = {
            mapa_index:null,
            pos:{
                x:null,
                y:null
            },
            camara:{
                x:null,
                y:null
            }
        }
        io.emit('registrar_usuario', msg);
        io.emit('listado_mapas', mapas);
    });

    socket.on('usuario_movimiento', (msg) => {
        usuario_movimiento(usuarios[socket.usuario].mapa_index,socket.usuario,msg.left,msg.top,msg.right,msg.bottom)
        let v = visibilidad(usuarios[socket.usuario])
        
        // let u = []
        // for (const key in usuarios) {
        //     if (key!=socket.usuario) u.push({...usuarios[key],usuario:key})
        // }
        socket.emit('actualizacion_usuario', {usuario:socket.usuario,posicion:usuarios[socket.usuario],visibilidad:v});
    });

    // **********************************************************************************
    // MAPA
    // **********************************************************************************
    socket.on('crear_mapa', (msg) => {
        // console.log('Mapa Creado: '+msg.nombre)
        let date = new Date();
        let id = date.getTime().toString(16)
        mapas.push({
            id: id ,
            nombre:msg.nombre,
            inicio:msg.inicio
        })
        mapas_design[id] = msg.mapa

        io.emit('listado_mapas', mapas);
    });

    socket.on('cargar_mapa', (msg) => {
        // console.log('Mapa Cargado: '+msg)    
        let pos = mapas.filter(data=>data.id==msg)[0].inicio

        // inicio del usuario
        // console.log(usuarios[socket.usuario])
        usuarios[socket.usuario].pos.x = pos.x
        usuarios[socket.usuario].pos.y = pos.y

        usuarios[socket.usuario].camara.x =(17 - (pos.x * 2))
        usuarios[socket.usuario].camara.y =(17 - (pos.y * 2))

        usuarios[socket.usuario].mapa_index = msg
        
        io.emit('cargar_mapa', {
            inicio:pos,
            mapa:mapas_design[msg]
        });
    });
});
 

setInterval(()=>{
    socket_actualizar_usuarios()
},50)

const socket_actualizar_usuarios=()=>{
    let u = []
    for (const key in usuarios) {
        u.push({...usuarios[key],usuario:key})
    }
    io.emit('actualizacion_usuarios', {usuarios:u});
}

const usuario_movimiento =(mapa_index,usuario_index,left,top,right,bottom)=>{
     if (left && !tope_muro(mapa_index,(usuarios[usuario_index].pos.x+0.2) - 0.25,(usuarios[usuario_index].pos.y+0.2))){
        usuarios[usuario_index].camara.x+=0.5
        usuarios[usuario_index].pos.x-=0.25
    }
    if (top && !tope_muro(mapa_index,(usuarios[usuario_index].pos.x+0.2),(usuarios[usuario_index].pos.y+0.2)-0.25)){
        usuarios[usuario_index].camara.y+=0.5
        usuarios[usuario_index].pos.y-=0.25
    }
    if (right && !tope_muro(mapa_index,(usuarios[usuario_index].pos.x+0.2)+0.5,(usuarios[usuario_index].pos.y+0.2))){
        usuarios[usuario_index].camara.x-=0.5
        usuarios[usuario_index].pos.x+=0.25
    }
    if (bottom && !tope_muro(mapa_index,(usuarios[usuario_index].pos.x+0.2),(usuarios[usuario_index].pos.y+0.2)+0.5)){
        usuarios[usuario_index].camara.y-=0.5
        usuarios[usuario_index].pos.y+=0.25
    }   
}


const visibilidad = (usuario)=>{
    let arr = []
    for(var rad = 0; rad<=360;rad+=2){
        let valid = true
        for(var radio = 10; radio<=250;radio+=15){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.7 * scaleY)}, rad,radio)
            let x = parseInt(usuario.pos.x-(8.5-(r.x/scaleX)))
            let y = parseInt(usuario.pos.y-(8.5-(r.y/scaleY)))
            if (valid) {
                
                let v = 1 -(radio/200)+0.5
                let p = (v>0.1)?((v>1)?1:v):0.1
                arr.push({
                    x,
                    y,
                    visible:p
                })                
            }
            if (tope_muro(usuario.mapa_index,x,y)) valid =false            
            // console.log(r.x)
            // if (valid) ctx.fillText("*", r.x,r.y);
        }
    }
   return arr
}

const clockwiseRotate = (center, angle,radius) => {
    var x = radius * Math.sin(Math.PI * 2 * angle / 360);
    var y = radius * Math.cos(Math.PI * 2 * angle / 360);
    
    return {
      x:    (Math.round(x * 100) / 100)+center.x,
      y:    (Math.round(y * 100) / 100)+center.y,
    
    }
  }
  

const tope_muro = (mapa_index,x,y)=>{
    if (mapas_design[mapa_index]){
        let mapa = mapas_design[mapa_index]
        return mapa[parseInt(x)] && mapa[parseInt(x)][parseInt(y)] && mapa[parseInt(x)][parseInt(y)].t==3
    }else{
        return false
    }
}




http.listen(3000, () => {
  console.log('listening on *:3000');  
});