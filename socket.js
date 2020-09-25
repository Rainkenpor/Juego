var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


const scaleX = 2000 / 40;
const scaleY = 2000 / 40;

var usuarios = []

var npcs = []

var mapas = []
var mapas_design = []

// conección de usuario
io.on('connection', (socket) => {
  socket.usuario = {}

    socket.on("disconnect", () => {
        mapas.map(data=>{
            data.usuarios = data.usuarios.filter(data=>data==socket.usuario)
        })
        console.log('eliminando '+socket.usuario) 
        delete usuarios[socket.usuario]
    })

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
        if (usuarios[socket.usuario]){
            usuario_movimiento(usuarios[socket.usuario].mapa_index,socket.usuario,msg.left,msg.top,msg.right,msg.bottom)
            let v = visibilidad(usuarios[socket.usuario])
            

            socket.emit('actualizacion_usuario', {usuario:socket.usuario,posicion:usuarios[socket.usuario],visibilidad:v});
        }else{
            console.log('no se encontro el usuario')
        }
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
            inicio:msg.inicio,
            usuarios:[]
        })
        mapas_design[id] = msg.mapa

        msg.mapa.map((item,x)=>{
            item.map((item_,y)=>{
                if (["🍎", "👻", "👽", "🤡", "🤬"].indexOf(item_.t)>=0){
                    npcs.push({
                        mapa_index:id,
                        x,
                        y,
                        npc:item_.t
                    })
                }
            })
        })
        
        io.emit('listado_mapas', mapas);
    });

    socket.on('cargar_mapa', (msg) => {
        // uniendose a la sala
        socket.join(msg);

        // console.log('Mapa Cargado: '+msg)    
        let p = mapas.filter(data=>data.id==msg)[0]
        let pos = p.inicio

        p.usuarios.push(socket.usuario)

        // inicio del usuario
        // console.log(usuarios[socket.usuario])
        usuarios[socket.usuario].pos.x = pos.x
        usuarios[socket.usuario].pos.y = pos.y

        usuarios[socket.usuario].camara.x =(17 - (pos.x * 2))
        usuarios[socket.usuario].camara.y =(17 - (pos.y * 2))

        usuarios[socket.usuario].mapa_index = msg

        socket.emit('cargar_mapa', {
            inicio:pos,
            mapa:mapas_design[msg]
        });
    });
});
 

setInterval(()=>{
    socket_actualizar_usuarios()
},30)


const socket_actualizar_usuarios=()=>{
    let u = []
    for (const key in usuarios) {
        u.push({...usuarios[key],usuario:key})
    }
    // io.emit('actualizacion_usuarios', {usuarios:u});
    mapas.map(data=>{
        let npcs_ = npcs.filter(data_=>data_.mapa_index==data.id)
        npc_movimiento(data.id,npcs_)
        io.to(data.id).emit('actualizacion_usuarios', {usuarios:u.filter(data_=>data_.mapa_index==data.id),npcs:npcs_});
    })
}


const npc_movimiento = (mapa_index,npcs)=>{
    npcs.map(data=>{
        let left = (Math.random()>0.5)?true:false
        let top = (Math.random()>0.5)?true:false
        let right = (!left)?true:false
        let bottom = (!top)?true:false


        if (left && !tope_muro(mapa_index,(data.x+0.2) - 0.25,(data.y+0.2)))data.x-=0.25
        if (top && !tope_muro(mapa_index,(data.x+0.2),(data.y+0.2)-0.25)) data.y-=0.25
        if (right && !tope_muro(mapa_index,(data.x+0.2)+0.5,(data.y+0.2)))data.x+=0.25
        if (bottom && !tope_muro(mapa_index,(data.x+0.2),(data.y+0.2)+0.5)) data.y+=0.25 
    })
      
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
        for(var radio = 10; radio<=200;radio+=15){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.7 * scaleY)}, rad,radio)
            let x = parseInt(usuario.pos.x-(8.5-(r.x/scaleX)))
            let y = parseInt(usuario.pos.y-(8.5-(r.y/scaleY)))
            if (valid) {
                
                let v = 1 -(radio/150)+0.5
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