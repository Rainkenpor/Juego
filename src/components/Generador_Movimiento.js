var mapa = []
var personaje = []
var camara = []
let scaleX = 2000 / 40;
let scaleY = 2000 / 40;
let canvas
let ctx
let img_muro
let img_piso
let img_camino

let mostrar_laberinto=true
// let img_arbusto
// let img_arbol
// let img_arbol2
// let img_roca

let usuario
let socket

let jugadores = []
let npcs = []
let visibilidad = []

function inicializar(el,socket_){
    mapa = el.mapa
    personaje = el.personaje
    camara = el.camara
    img_muro = document.getElementById("muro");
    img_piso = document.getElementById("piso");
    img_camino = document.getElementById("camino");
    // img_arbusto = document.getElementById("arbusto");
    // img_arbol = document.getElementById("arbol");
    // img_arbol2 = document.getElementById("arbol2");
    // img_roca = document.getElementById("roca");
    canvas = document.querySelector(".screen") || new HTMLCanvasElement();
    ctx = canvas.getContext("2d") || new CanvasRenderingContext2D();
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    // console.log(el)
    usuario = el.nombre_usuario
    socket = socket_

    //npc
    // mapa.map((data,item)=>{
    //     let x = item
    //     data.map((data_,item_)=>{
    //         let y = item_
    //         if (["👻", "👽", "🤡", "🤬"].indexOf(data_.t)>=0) {
    //             npc.push({
    //                 npc:data_.t,
    //                 x,
    //                 y
    //             })
    //         }
    //     })
    // })
    
    // console.log('npc',npc)
    // jugadores
    socket.on('actualizacion_usuario', (data) => {
        // console.log(data.posicion)
        // console.log(data.usuarios)
        camara.x = data.posicion.camara.x
        camara.y = data.posicion.camara.y
        personaje.x = data.posicion.pos.x
        personaje.y = data.posicion.pos.y
        visibilidad = data.visibilidad
        // actualizar()
    })

    socket.on('actualizacion_usuarios',(data)=>{
        npcs = data.npcs
        jugadores = data.usuarios.map(data=>{
            return {
                x:data.pos.x,
                y:data.pos.y,
                usuario:data.usuario
            }
        })
        actualizar()
    })
}

function movimiento (keypress,socket){
    socket.emit('usuario_movimiento',{ left:keypress[37],top:keypress[38],right:keypress[39],bottom:keypress[40]})    
}


function actualizar(){
    let camaraX = ((camara.x * (scaleX/2)))
    let camaraY = ((camara.y  * (scaleY/2)))
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let m = []
    visibilidad.map(data=>{
        if (!m[data.x]) m[data.x]=[]
        m[data.x][data.y]=data.visible
    })
    mapa.map((data,item)=>{
        let x = item
        data.map((data_,item_)=>{
            let y = item_
            let visible =(m[x] && m[x][y])?m[x][y]:0
            let v = (visible>0)?visible: (data_.mostrar==true && mostrar_laberinto)?0.2:0;
            if (v>0){
                ctx.globalAlpha =v
                if (ctx.globalAlpha>0 && mostrar_laberinto) data_.mostrar=true
                if (data_.t==3) ctx.drawImage(img_muro, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50);
                if (data_.t==1) ctx.drawImage(img_piso, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
                if (data_.t==2) ctx.drawImage(img_camino, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
                if (["🍎", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺","😀"].indexOf(data_.t)>=0) {
                    ctx.drawImage(img_piso, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
                }
            }
        })
    })

    ctx.globalAlpha = 1;
    ctx.font = "bold 18px 'IBM Plex Mono', monospace"
    ctx.fillText(usuario.split('_')[1], (personaje.x * scaleX)+ camaraX, (personaje.y * scaleY)+ camaraY-25);

    ctx.font = "bold 25px 'IBM Plex Mono', monospace"
    ctx.fillText("😃", (personaje.x * scaleX)+ camaraX, (personaje.y * scaleY)+ camaraY);
    

    // jugadores
    jugadores.map(p=>{
        if (p.usuario!=usuario){
            let x = parseInt(p.x)
            let y = parseInt(p.y)
            let visible =(m[x] && m[x][y])?m[x][y]:0
            if (visible>0){
                ctx.globalAlpha = visible;
                ctx.fillText(p.usuario.split('_')[1], (p.x * scaleX)+ camaraX, (p.y * scaleY)+ camaraY-25);
                ctx.fillText("😎", (p.x * scaleX)+ camaraX, (p.y * scaleY)+ camaraY);
            }
        }
    })

    //npcs
    npcs.map(data=>{
        let x = parseInt(data.x)
        let y = parseInt(data.y)
        let visible =(m[x] && m[x][y])?m[x][y]:0
        if (visible>0){
            ctx.globalAlpha = visible;
            // ctx.fillText(p.usuario.split('_')[1], (p.x * scaleX)+ camaraX, (p.y * scaleY)+ camaraY-25);
            ctx.fillText(data.npc, (data.x * scaleX)+ camaraX, (data.y * scaleY)+ camaraY);
        }
    })

    // //
    // npc.map(data=>{
    //     ctx.fillText(data.npc, (data.x * scaleX)+ camaraX, (data.y * scaleY)+ camaraY);
    // })

    // mapa.map((data,item)=>{
    //     let x = item
    //     data.map((data_,item_)=>{
    //         let y = item_
    //         let visible =(m[x] && m[x][y])?m[x][y]:0
    //         let v = (visible>0)?visible: (data_.mostrar==true)?0.2:0;
    //         if (v>0){
    //             if (["🍎", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺"].indexOf(data_.t)>=0) {
                    
    //                 ctx.globalAlpha =v
    //                 const img = [img_arbusto,img_arbol,img_roca,img_arbol2]
                    
    //                 // if (data_.t=="👻") 
    //                 // if (data_.t=="👽") ctx.fillText("👽", (x * scaleX)+ camaraX, (y * scaleY)+ camaraY);
    //                 // if (data_.t=="🤬") ctx.fillText("🤬", (x * scaleX)+ camaraX, (y * scaleY)+ camaraY);
    //                 // if (data_.t=="🤡") ctx.fillText("🤡", (x * scaleX)+ camaraX, (y * scaleY)+ camaraY);

    //                 if (data_.t=="🌲" || data_.t=="👻") ctx.drawImage(img[0], (x * scaleX)+ camaraX - 20, (y * scaleY)+ camaraY ,80,50); 
    //                 if (data_.t=="🍎" || data_.t=="👽") ctx.drawImage(img[1], (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
    //                 if (data_.t=="🧠" || data_.t=="🤬") ctx.drawImage(img[2], (x * scaleX)+ camaraX -5, (y * scaleY)+ camaraY -30 ,55,90);  
    //                 if (data_.t=="🍺" || data_.t=="🤡") ctx.drawImage(img[3], (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
                    
    //                 if (data_.t=="🌟"){    
    //                     if (!data_.index){
    //                         const random = Math.floor(Math.random() * img.length);
    //                         data_.index = random
    //                     }
    //                     if (data_.index==0)ctx.drawImage(img_arbusto, (x * scaleX)+ camaraX - 20, (y * scaleY)+ camaraY ,80,50); 
    //                     if (data_.index==1)ctx.drawImage(img_arbol, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90);
    //                     if (data_.index==2)ctx.drawImage(img_roca, (x * scaleX)+ camaraX -5, (y * scaleY)+ camaraY -30 ,55,90); 
    //                     if (data_.index==3)ctx.drawImage(img_arbol2, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
    //                 } 

    //             }
    //         }
            
    //     })
    // }) 

    // ctx.globalAlpha = 0.3;
    // ctx.fillText("😃", (personaje.x * scaleX)+ camaraX, (personaje.y * scaleY)+ camaraY);
    

     
}

const actualizar_joystick = (estado)=>{
    mostrar_laberinto = estado
}


export {inicializar,movimiento,actualizar,actualizar_joystick}