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
        // mapas.map(data=>{
        //     data.usuarios = data.usuarios.filter(data=>data==socket.usuario)
        // })
        console.log('eliminando '+socket.mapa_index + ' - '+ socket.usuario) 
        if (usuarios[socket.mapa_index] && usuarios[socket.mapa_index][socket.usuario]) delete usuarios[socket.mapa_index][socket.usuario]
    })

    // **********************************************************************************
    // USUARIOS
    // **********************************************************************************
    socket.on('registrar_usuario', (usuario_id) => {
        // console.log('Usuario: '+usuario_id)
        socket.usuario = usuario_id
        
        io.emit('registrar_usuario', usuario_id);
        io.emit('listado_mapas', mapas);
    });

    socket.on('usuario_movimiento', (msg) => { 
        if (usuarios[socket.mapa_index] && usuarios[socket.mapa_index][socket.usuario]){
            usuario_movimiento(socket.mapa_index,socket.usuario,msg.left,msg.top,msg.right,msg.bottom)
            let v = visibilidad(socket.mapa_index,usuarios[socket.mapa_index][socket.usuario])
             
            socket.emit('actualizacion_usuario', {usuario:socket.usuario,posicion:usuarios[socket.mapa_index][socket.usuario],visibilidad:v});
        }else{
            // console.log('no se encontro el usuario')
        }
    });

    // **********************************************************************************
    // MAPA
    // **********************************************************************************
    socket.on('crear_mapa', (mapa_) => {
        // console.log('Mapa Creado: '+mapa_.nombre)
        let date = new Date();
        let mapa_index = date.getTime().toString(16)
        mapas.push({
            id: mapa_index ,
            nombre:mapa_.nombre,
            inicio:mapa_.inicio
        })
        mapas_design[mapa_index] = mapa_.mapa

        if (!npcs[mapa_index]) npcs[mapa_index] = []

        mapa_.mapa.map((item,x)=>{
            item.map((item_,y)=>{
                if (["🤖", "👻", "👽", "🤡", "🤬"].indexOf(item_.t)>=0){
                    npcs[mapa_index].push({
                        x,
                        y,
                        npc:item_.t
                    })
                }
            })
        })
        
        io.emit('listado_mapas', mapas);
    });

    socket.on('cargar_mapa', (mapa_index) => {
        // uniendose a la sala
        socket.join(mapa_index);

        socket.mapa_index = mapa_index

        // console.log('Mapa Cargado: '+mapa_index)    
        let p = mapas.filter(data=>data.id==mapa_index)[0]
        let pos = p.inicio

        // p.usuarios.push(socket.usuario)

        // inicio del usuario
        // console.log(usuarios[socket.usuario])
        if (!usuarios[mapa_index]) usuarios[mapa_index] = []
        
        // creando información del usuario
        if (!usuarios[mapa_index][socket.usuario]){
            usuarios[mapa_index][socket.usuario] = {
                vida:100,
                pos:{
                    x:null,
                    y:null
                },
                camara:{
                    x:null,
                    y:null
                },
                estados:[]
            }
        }
        usuarios[mapa_index][socket.usuario].pos.x = pos.x
        usuarios[mapa_index][socket.usuario].pos.y = pos.y

        usuarios[mapa_index][socket.usuario].camara.x =(17 - (pos.x * 2))
        usuarios[mapa_index][socket.usuario].camara.y =(17 - (pos.y * 2))

        // usuarios[mapa_index][socket.usuario].mapa_index = mapa_index

        socket.emit('cargar_mapa', {
            inicio:pos,
            mapa:mapas_design[mapa_index]
        });
    });
});
 

setInterval(()=>{
    socket_actualizar_usuarios()
},30)


const socket_actualizar_usuarios=()=>{
    // io.emit('actualizacion_usuarios', {usuarios:u});
    mapas.map(data=>{
        //si el mapa contiene un usuario
        if (usuarios[data.id] && Object.keys(usuarios[data.id]).length>0){
            let u = []
            for (const key in usuarios[data.id]) {
                //limpiando estados 
                usuarios[data.id][key].estados = []
                u.push({...usuarios[data.id][key],usuario:key})
            }
            npc_movimiento(data.id,npcs[data.id])
            io.to(data.id).emit('actualizacion_usuarios', {usuarios:u,npcs:npcs[data.id]});
        }
    })
}


const npc_movimiento = (mapa_index,npcs)=>{
    npcs.map(npc=>{
        // let left = (Math.random()>0.5)?true:false
        // let top = (Math.random()>0.5)?true:false
        // let right = (!left)?true:false
        // let bottom = (!top)?true:false
        
            npc_visibilidad(mapa_index,npc)
            
        // if (u.length>0) console.log(u)

        // if (left && !tope_muro(mapa_index,(npc.x+0.2) - 0.25,(npc.y+0.2)))npc.x-=0.25
        // if (top && !tope_muro(mapa_index,(npc.x+0.2),(npc.y+0.2)-0.25)) npc.y-=0.25
        // if (right && !tope_muro(mapa_index,(npc.x+0.2)+0.5,(npc.y+0.2)))npc.x+=0.25
        // if (bottom && !tope_muro(mapa_index,(npc.x+0.2),(npc.y+0.2)+0.5)) npc.y+=0.25 
    }) 
      
}


const npc_visibilidad = (mapa_index,npc)=>{
    let usuario_encontrado=[]

    //velocidad
    let velocidad = 0.02
    let vida = 0.4

    if (npc.npc=='👻') velocidad=0.025
    if (npc.npc=='🤬') velocidad=0.04
    if (npc.npc=="🤖") velocidad = 0.01
    if (npc.npc=='🤬') vida=0.6
    if (npc.npc=="🤖")  vida = 1.5

    for(var rad = 0; rad<=360;rad+=10){
        let valid = true
        // radio
        for(var radio = 0; radio<=200;radio+=30){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.7 * scaleY)}, rad,radio)
            let x = parseInt(npc.x-(8.5-(r.x/scaleX)))
            let y = parseInt(npc.y-(8.5-(r.y/scaleY)))
            if (valid) { 
                
                // buscando si hay un usuario dentro del rango
                for (const key in usuarios[mapa_index]) {
                    let data = usuarios[mapa_index][key]
                    // console.log(data.pos.x,data.pos.y)
                    // arr.push(data)
                    if (!usuario_encontrado[key] && data.vida>0){
                        if (parseInt(data.pos.x) == x && parseInt(data.pos.y)==y){
                            npc.x += (data.pos.x > npc.x ) ?velocidad:-velocidad
                            npc.y += (data.pos.y > npc.y ) ?velocidad:-velocidad
                            
                            //agregando estados
                            data.estados.push(npc.npc)
                            
                            if (parseInt(npc.x) == parseInt(data.pos.x) &&  parseInt(npc.y) == parseInt(data.pos.y)){
                                data.vida-=vida
                                if (data.vida<0) data.vida=0
                            }
                            usuario_encontrado[key] = true
                        }
                    }
                }
            }
            if (npc.npc!='👻')
                if (tope_muro(mapa_index,x,y)) valid =false            
            // console.log(r.x)
            // if (valid) ctx.fillText("*", r.x,r.y);
        }
    }
//    return arr
}


const usuario_movimiento =(mapa_index,usuario_index,left,top,right,bottom)=>{
     if (left && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x+0.2) - 0.25,(usuarios[mapa_index][usuario_index].pos.y+0.2))){
        usuarios[mapa_index][usuario_index].camara.x+=0.5
        usuarios[mapa_index][usuario_index].pos.x-=0.25
    }
    if (top && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x+0.2),(usuarios[mapa_index][usuario_index].pos.y+0.2)-0.25)){
        usuarios[mapa_index][usuario_index].camara.y+=0.5
        usuarios[mapa_index][usuario_index].pos.y-=0.25
    }
    if (right && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x+0.2)+0.5,(usuarios[mapa_index][usuario_index].pos.y+0.2))){
        usuarios[mapa_index][usuario_index].camara.x-=0.5
        usuarios[mapa_index][usuario_index].pos.x+=0.25
    }
    if (bottom && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x+0.2),(usuarios[mapa_index][usuario_index].pos.y+0.2)+0.5)){
        usuarios[mapa_index][usuario_index].camara.y-=0.5
        usuarios[mapa_index][usuario_index].pos.y+=0.25
    }   
}


const visibilidad = (mapa_index,usuario)=>{
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
            if (tope_muro(mapa_index,x,y)) valid =false            
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