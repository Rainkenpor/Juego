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
        let arr = []
        for (const key in mapas) {
            arr.push(mapas[key])
        }
        io.emit('listado_mapas', arr);
    });

    socket.on('usuario_movimiento', (msg) => { 
        if (mapas[socket.mapa_index].play  && usuarios[socket.mapa_index] && usuarios[socket.mapa_index][socket.usuario] && usuarios[socket.mapa_index][socket.usuario].vidas>0){
            //indicando que ha iniciado
            socket.play = true
            usuarios[socket.mapa_index][socket.usuario].play = true

            usuario_movimiento(socket.mapa_index,socket.usuario,msg.left,msg.top,msg.right,msg.bottom)
            let v = visibilidad(socket.mapa_index,usuarios[socket.mapa_index][socket.usuario])
             
            socket.emit('actualizacion_usuario', {usuario:socket.usuario,posicion:usuarios[socket.mapa_index][socket.usuario],visibilidad:v});
        }
    });

    // **********************************************************************************
    // MAPA
    // **********************************************************************************
    socket.on('crear_mapa', (mapa_) => {
        // console.log('Mapa Creado: '+mapa_.nombre)
        let date = new Date();
        let mapa_index = date.getTime().toString(16)
        mapas[mapa_index] = {
            id: mapa_index ,
            nombre:mapa_.nombre,
            inicio:mapa_.inicio,
            min_usuarios:mapa_.min_usuarios,
            play:false
        }
        mapas_design[mapa_index] = mapa_.mapa

        if (!npcs[mapa_index]) npcs[mapa_index] = []

        mapa_.mapa.map((item,x)=>{
            item.map((item_,y)=>{
                if (["💀", "👻", "👽", "🤡", "🤬","🌲"].indexOf(item_.t)>=0){
                    npcs[mapa_index].push({
                        index:npcs[mapa_index].length,
                        x,
                        y,
                        npc:item_.t,
                        completado: 0
                    })
                }
            })
        })
        let arr = []
        for (const key in mapas) {
            arr.push(mapas[key])
        }
        io.emit('listado_mapas', arr);
    });

    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    socket.on('cargar_mapa', (mapa_index) => {
        // uniendose a la sala
        

        socket.mapa_index = mapa_index
        socket.play = false

        let p = mapas[mapa_index]
        let pos = p.inicio

        // p.usuarios.push(socket.usuario)

        // inicio del usuario
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
                vidas:3,
                estados:[],
                objetos:[],
                objetos_completados:0,
                play:false
            }
        }
        usuarios[mapa_index][socket.usuario].pos.x = pos.x
        usuarios[mapa_index][socket.usuario].pos.y = pos.y

        usuarios[mapa_index][socket.usuario].camara.x =(17 - (pos.x * 2))
        usuarios[mapa_index][socket.usuario].camara.y =(17 - (pos.y * 2))

        // usuarios[mapa_index][socket.usuario].mapa_index = mapa_index
        let usuarios_mapa = (io.sockets.adapter.rooms[mapa_index])?io.sockets.adapter.rooms[mapa_index].length:0
        console.log('usuarios en mapa: '+(usuarios_mapa+1) + ' de '+p.min_usuarios)
        if (usuarios_mapa < p.min_usuarios ){
            socket.join(mapa_index);
            socket.emit('cargar_mapa', {
                inicio:pos,
                mapa:mapas_design[mapa_index]
            });

            //iniciando juego
            if (usuarios_mapa +1 == p.min_usuarios) mapas[mapa_index].play = true

        }else{
            // console.log(2)
            socket.emit('cargar_mapa', {
                fail:true
            })
        }
    });
});
 

setInterval(()=>{
    socket_actualizar_usuarios()
},30)


const socket_actualizar_usuarios=()=>{
    // io.emit('actualizacion_usuarios', {usuarios:u});
    for (const key in mapas) {
    let data = mapas[key]
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
    }
}


const npc_movimiento = (mapa_index,npcs)=>{
    npcs.map(npc=>{
        npc_visibilidad(mapa_index,npc)
    }) 
}


const npc_visibilidad = (mapa_index,npc)=>{
    let usuario_encontrado=[]

    //velocidad
    let velocidad = 0.02
    let vida = -0.4
    let max_radio = 200

    //bueno
    if (npc.npc=="🌲") {velocidad = 0; max_radio=100; vida = 0.05}

    //malo
    if (npc.npc=='👻') velocidad=0.025
    if (npc.npc=='🤬') velocidad=0.04
    if (npc.npc=="💀") velocidad = 0.01
    if (npc.npc=='🤬') vida = -0.6
    if (npc.npc=="💀")  vida = -2

    for(var rad = 0; rad<=360;rad+=10){
        let valid = true
        // radio
        for(var radio = 0; radio<=max_radio;radio+=30){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.7 * scaleY)}, rad,radio)
            let x = parseInt(npc.x-(8.5-(r.x/scaleX)))
            let y = parseInt(npc.y-(8.5-(r.y/scaleY)))
            if (valid) { 
                let usuario_cercano = {
                    usuario_id:null,
                    distancia:9999
                }
                // buscando si hay un usuario dentro del rango
                for (const key in usuarios[mapa_index]) {
                    let data = usuarios[mapa_index][key]
                    if (!usuario_encontrado[key] && data.vida>0 && data.play){
                        if (parseInt(data.pos.x) == x && parseInt(data.pos.y)==y){
                            let distancia =Math.sqrt( (data.pos.x - x) * (data.pos.x - x) + (data.pos.y - y) * (data.pos.y - y));
                            if (usuario_cercano.distancia>distancia){
                                usuario_cercano.distancia=distancia
                                usuario_cercano.usuario_id=key
                            }
                            //agregando estados
                            data.estados.push(npc.npc)

                            if (parseInt(npc.x) == parseInt(data.pos.x) &&  parseInt(npc.y) == parseInt(data.pos.y)){
                                data.vida += vida
                                if (data.vida<0) data.vida=0
                                if (data.vida>100) data.vida=100
                                
                                //objetos encontrados
                                if (npc.npc=="🌲"){
                                    if (!data.objetos[npc.index]) data.objetos[npc.index] = 0
                                    if (data.objetos[npc.index] < 29) {
                                        data.objetos[npc.index]++
                                    }else{
                                        if (data.objetos[npc.index] == 29){
                                            data.objetos_completados+= (npc.npc=="🌲")?10:0
                                            data.objetos[npc.index] = 30
                                        }
                                    }
                                }
                            }
                            usuario_encontrado[key] = true
                        }
                    }
                    // movimiento al mas cercano
                    if (usuario_cercano.usuario_id!=null){
                        let x = npc.x + ((usuarios[mapa_index][usuario_cercano.usuario_id].pos.x +0.1 > npc.x ) ?velocidad:-velocidad)
                        let y = npc.y + ((usuarios[mapa_index][usuario_cercano.usuario_id].pos.y +0.1 > npc.y ) ?velocidad:-velocidad)
                        npc.x = x
                        npc.y = y
                    }

                    //mover al usuario al punto de inicio

                    if ( data.vida==0){
                        let p = mapas[mapa_index]
                        let pos = p.inicio
                        usuarios[mapa_index][usuario_cercano.usuario_id].vidas--
                        usuarios[mapa_index][usuario_cercano.usuario_id].play = false
                        usuarios[mapa_index][usuario_cercano.usuario_id].estados = []
                        usuarios[mapa_index][usuario_cercano.usuario_id].vida = 100
                        usuarios[mapa_index][usuario_cercano.usuario_id].pos.x = pos.x
                        usuarios[mapa_index][usuario_cercano.usuario_id].pos.y = pos.y
                        usuarios[mapa_index][usuario_cercano.usuario_id].camara.x =(17 - (pos.x * 2))
                        usuarios[mapa_index][usuario_cercano.usuario_id].camara.y =(17 - (pos.y * 2))
                    }
                }
            }
        }
    }
}

var tiempo_movimiento = []
const usuario_movimiento =(mapa_index,usuario_index,left,top,right,bottom)=>{
    if (tiempo_movimiento[usuario_index]==null){
        tiempo_movimiento[usuario_index] = setTimeout(()=>{
            let velocidad = 0.25
            // console.log(usuario_index)
            //efectos de movimiento
            if (usuarios[mapa_index][usuario_index].estados.indexOf('👻')>=0) velocidad = 0.25
            // if (usuarios[mapa_index][usuario_index].estados.indexOf('👽')>=0){
            //     left = !left
            //     top = !top
            //     right = !right
            //     bottom = !bottom
            // } 

            if (left && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x) - (velocidad/2),(usuarios[mapa_index][usuario_index].pos.y))){
                usuarios[mapa_index][usuario_index].camara.x+=velocidad
                usuarios[mapa_index][usuario_index].pos.x-=(velocidad/2)
            }
            if (top && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x),(usuarios[mapa_index][usuario_index].pos.y)-(velocidad/2))){
                usuarios[mapa_index][usuario_index].camara.y+=velocidad
                usuarios[mapa_index][usuario_index].pos.y-=(velocidad/2)
            }
            if (right && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x)+(velocidad/2)+0.5,(usuarios[mapa_index][usuario_index].pos.y))){
                usuarios[mapa_index][usuario_index].camara.x-=velocidad
                usuarios[mapa_index][usuario_index].pos.x+=(velocidad/2)
            }
            if (bottom && !tope_muro(mapa_index,(usuarios[mapa_index][usuario_index].pos.x),(usuarios[mapa_index][usuario_index].pos.y)+(velocidad/2)+0.5)){
                usuarios[mapa_index][usuario_index].camara.y-=velocidad
                usuarios[mapa_index][usuario_index].pos.y+=(velocidad/2)
            }
            clearTimeout(tiempo_movimiento[usuario_index])  
            delete tiempo_movimiento[usuario_index]
        },20)
    }
}


const visibilidad = (mapa_index,usuario)=>{
    let radio_visible = 200
    if (usuario.estados.indexOf('👽')>=0) radio_visible = 100
    let ar = []
    let arr = []
    for(var rad = 0; rad<=360;rad+=2){
        let valid = true
        for(var radio = 10; radio<=radio_visible;radio+=15){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.7 * scaleY)}, rad,radio)
            let x = parseInt(usuario.pos.x-(8.5-(r.x/scaleX)))
            let y = parseInt(usuario.pos.y-(8.5-(r.y/scaleY)))
            if (valid) {
                let v = 1 -(radio/(radio_visible))
                let p = (v>0.1)?((v>1)?1:v):0.1
                if (!ar[x]) ar[x] = []
                ar[x][y] = p               
            }
            if (tope_muro(mapa_index,x,y)) valid =false            
        }
    }

    for (const x in ar) {
        for (const y in ar[x]) {
            arr.push({
                x,
                y,
                visible:ar[x][y]
            }) 
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