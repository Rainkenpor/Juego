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
let img_arbusto
let img_arbol
let img_arbol2
let img_roca

function inicializar(el){
    mapa = el.mapa
    personaje = el.personaje
    camara = el.camara
    img_muro = document.getElementById("muro");
    img_piso = document.getElementById("piso");
    img_camino = document.getElementById("camino");
    img_arbusto = document.getElementById("arbusto");
    img_arbol = document.getElementById("arbol");
    img_arbol2 = document.getElementById("arbol2");
    img_roca = document.getElementById("roca");
    canvas = document.querySelector(".screen") || new HTMLCanvasElement();
    ctx = canvas.getContext("2d") || new CanvasRenderingContext2D();

    
}

function movimiento (keypress){
    
    // ctx.drawImage(img_muro, x, y,50,50);

    if (keypress[37] && !tope_muro((personaje.x+0.2) - 0.25,(personaje.y+0.2))){
        camara.x+=0.5
        personaje.x-=0.25
    }
    if (keypress[38] && !tope_muro((personaje.x+0.2),(personaje.y+0.2)-0.25)){
        camara.y+=0.5
        personaje.y-=0.25
    }
    if (keypress[39] && !tope_muro((personaje.x+0.2)+0.5,(personaje.y+0.2))){
        camara.x-=0.5
        personaje.x+=0.25
    }
    if (keypress[40] && !tope_muro((personaje.x+0.2),(personaje.y+0.2)+0.5)){
        camara.y-=0.5
        personaje.y+=0.25
    }

    actualizar()
    
}
function actualizar(){
    let camaraX = ((camara.x * (scaleX/2)))
    let camaraY = ((camara.y  * (scaleY/2)))
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let m = visibilidad()    
    mapa.map((data,item)=>{
        let x = item
        data.map((data_,item_)=>{
            let y = item_
            let visible =(m[x] && m[x][y])?m[x][y]:0
            ctx.globalAlpha =(visible>0)?visible: (data_.mostrar==true)?0.2:0;
            if (ctx.globalAlpha>0) data_.mostrar=true
            if (data_.t==3) ctx.drawImage(img_muro, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50);
            if (data_.t==1) ctx.drawImage(img_piso, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
            if (data_.t==2) ctx.drawImage(img_camino, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
            if (["🍎", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺","😀"].indexOf(data_.t)>=0) {
                ctx.drawImage(img_piso, (x * scaleX)+ camaraX, (y * scaleY)+ camaraY,50,50); 
            }
            // console.log(data_.t)
        })
    })

    ctx.globalAlpha = 1;
    ctx.fillText("😃", (personaje.x * scaleX)+ camaraX, (personaje.y * scaleY)+ camaraY);

    mapa.map((data,item)=>{
        let x = item
        data.map((data_,item_)=>{
            let y = item_
            if (["🍎", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺"].indexOf(data_.t)>=0) {
                let visible =(m[x] && m[x][y])?m[x][y]:0
                ctx.globalAlpha =(visible>0)?visible: (data_.mostrar==true)?0.2:0;
                if (data_.t=="🌲") ctx.drawImage(img_arbusto, (x * scaleX)+ camaraX - 20, (y * scaleY)+ camaraY ,80,50); 
                if (data_.t=="👻") ctx.drawImage(img_arbusto, (x * scaleX)+ camaraX - 20, (y * scaleY)+ camaraY ,80,50); 

                if (data_.t=="🍎") ctx.drawImage(img_arbol, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
                if (data_.t=="👽") ctx.drawImage(img_arbol, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30,80,90); 

                if (data_.t=="🧠") ctx.drawImage(img_roca, (x * scaleX)+ camaraX -5, (y * scaleY)+ camaraY -30 ,55,90); 
                if (data_.t=="🤬") ctx.drawImage(img_roca, (x * scaleX)+ camaraX -5, (y * scaleY)+ camaraY -30,55,90); 

                if (data_.t=="🍺") ctx.drawImage(img_arbol2, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
                if (data_.t=="🤡") ctx.drawImage(img_arbol2, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 

                
                if (data_.t=="🌟"){
                    const img = [img_arbusto,img_arbol,img_roca,img_arbol2]
                    if (!data_.index){
                        const random = Math.floor(Math.random() * img.length);
                        data_.index = random
                    }
                    if (data_.index==0)ctx.drawImage(img_arbusto, (x * scaleX)+ camaraX - 20, (y * scaleY)+ camaraY ,80,50); 
                    if (data_.index==1)ctx.drawImage(img_arbol, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90);
                    if (data_.index==2)ctx.drawImage(img_roca, (x * scaleX)+ camaraX -5, (y * scaleY)+ camaraY -30 ,55,90); 
                    if (data_.index==3)ctx.drawImage(img_arbol2, (x * scaleX)+ camaraX -20, (y * scaleY)+ camaraY -30 ,80,90); 
                } 

            }
            
        })
    })

    

    
}


function visibilidad(){
    // console.log(personaje)
    // let total = 3
    
    
    // let i=0,t=0
    // // let r = 0
    // let canvas = document.querySelector(".screen") || new HTMLCanvasElement();
    // let ctx = canvas.getContext("2d") || new CanvasRenderingContext2D();
    let arr = []
    for(var rad = 0; rad<=360;rad+=1){
        ctx.fillStyle = "white";
        let valid = true
        for(var radio = 10; radio<=200;radio+=30){
            let r = clockwiseRotate( {x:(8.7 * scaleX), y:(8.5 * scaleY)}, rad,radio)
            let x = parseInt(personaje.x-(8.7-(r.x/scaleX)))
            let y = parseInt(personaje.y-(8.5-(r.y/scaleY)))
            if (valid) {
                if (!arr[x]) arr[x]=[]
                let v = 1 -(radio/150)+0.5
                arr[x][y]=(v>0.2)?((v>1)?1:v):0.2
                // ctx.fillText('*', r.x, r.y);
            }
            if (tope_muro(x,y)) valid =false
            
        }
    }



    // console.log(mapa[x][y].mostrar)
    // let r = !tope_muro(x+i,y+t)
//    r = 1
   return arr
    
    
}

const clockwiseRotate = (center, angle,radius) => {
    // var radius = 60;
    
    var x = radius * Math.sin(Math.PI * 2 * angle / 360);
    var y = radius * Math.cos(Math.PI * 2 * angle / 360);

    
    // let center1 = center
    return {
      x:    (Math.round(x * 100) / 100)+center.x,
      y:    (Math.round(y * 100) / 100)+center.y,
    
    }
  }
  

function tope_muro(x,y){
    // console.log(x,mapa[parseInt(x)][parseInt(y)])
    return mapa[parseInt(x)] && mapa[parseInt(x)][parseInt(y)] && mapa[parseInt(x)][parseInt(y)].t==3
}


export {inicializar,movimiento,actualizar}