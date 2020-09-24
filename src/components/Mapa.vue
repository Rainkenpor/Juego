<template>
<div>

<button v-if="mostrar_finalizar" @click="cerrar_mapa" style="position: absolute; top: 0px;left:100px;z-index: 99;background-color: black;border: 1px solid #111;">Cerrar Mapa</button>
    <div style="color:white;font-size:20px" v-if="!visible_canvas">
        Cargando...
    </div>
    
    <canvas width="900" height="900" class="screen" v-show="visible_canvas"></canvas>

    <div style="background-color:white;position:absolute;" v-show="false">
        <img id="muro" :src="require(`../assets/mapa/Tiles/Tile_31.png`)">
        <img id="piso" :src="require(`../assets/mapa/Tiles/Tile_12.png`)">
        <img id="camino" :src="require(`../assets/mapa/Tiles/Tile_58.png`)">

        <img id="caja" :src="require(`../assets/mapa/Objects/Boxes/1.png`)">

        <img id="arbusto" :src="require(`../assets/mapa/Objects/Bushes/4.png`)">
        <img id="arbol" :src="require(`../assets/mapa/Objects/Ridges/4.png`)">
        <img id="arbol2" :src="require(`../assets/mapa/Objects/Willows/1.png`)">
        <img id="roca" :src="require(`../assets/mapa/Objects/Stones/1.png`)">
        <!-- <img id="camino" :src="require(`../assets/mapa/Tiles/Tile_58.png`)"> -->
        <!-- {{personaje}} -->

    </div>
    <div style="position:absolute;top:900px;left:350px">

        <button v-if="joystick_==false" @click="joystick_=true">Habilitar JoyStick</button>
        
        <!-- <div  style="position:relative;overflow:hidden"> -->
        <div v-show="joystick_" id="joyDiv" style="width:200px;height:200px"></div>
        <!-- </div> -->
    </div>

</div>
</template>

<script>
import {
    generar
} from './Generador.js'
import {
    inicializar,
    movimiento,
    actualizar
} from './Generador_Movimiento.js'

import JoyStick from '../assets/js/joy.js'

export default {
    data() {
        return {
            mapa: [],
            camara: {
                x: 0,
                y: 0
            },
            personaje: {
                x: 0,
                y: 0
            },
            jugadores: [],
            joystick_: true,
            visible_canvas: false,
            mostrar_finalizar: false
        }
    },
    props: {
        socket: {
            default: null
        },
        servidor_mapa: {
            default: []
        },
        servidor_personaje: {
            default: null
        },
        usuario:{
            default:null
        }
    },
    methods: {
        iniciar() {
            // inicializando mapa
            inicializar(this)
            this.joystick_ = false
            this.visible_canvas = true
            let keysPressed = []
            this.camara.x = (17 - (this.personaje.x * 2))
            this.camara.y = (17 - (this.personaje.y * 2))

            // actualización de camara
            actualizar()

            if (this.servidor_personaje == null) {
                this.socket.emit('room_msg', {
                    uniq: "juego_laberinto",
                    my_exclude: false,
                    persistent: true,
                    message: {
                        type: 'juego_mapa',
                        mapa: this.mapa,
                        personaje:[
                            {
                                usuario:this.usuario,
                                personaje:this.personaje
                            }
                        ] 
                    }
                })
            } 

            this.mostrar_finalizar = true
            

            document.addEventListener('keydown', (event) => {
                keysPressed[event.keyCode] = true;
            });

            document.addEventListener('keyup', (event) => {
                delete keysPressed[event.keyCode];
            });

            setInterval(() => {
                if (!this.joystick_) {
                    if (keysPressed[37] || keysPressed[38] || keysPressed[39] || keysPressed[40]) {
                        movimiento(keysPressed,this.socket)
                    }
                }
            }, 30)

            var joy = new JoyStick('joyDiv');
            setInterval(()=> {
                if (this.joystick_) {

                    delete keysPressed[37]
                    delete keysPressed[38]
                    delete keysPressed[39]
                    delete keysPressed[40]
                    let p = joy.GetDir();
                    console.log(p)
                    if (p == 'N') keysPressed[38] = true
                    if (p == 'E') keysPressed[39] = true
                    if (p == 'NE') {
                        keysPressed[38] = true
                        keysPressed[39] = true
                    }
                    if (p == 'SE') {
                        keysPressed[40] = true
                        keysPressed[39] = true
                    }
                    if (p == 'W') keysPressed[37] = true
                    if (p == 'S') keysPressed[40] = true
                    if (p == 'NW') {
                        keysPressed[38] = true
                        keysPressed[37] = true
                    }
                    if (p == 'SW') {
                        keysPressed[40] = true
                        keysPressed[37] = true
                    }

                    // console.log(p)
                    if (keysPressed[37] || keysPressed[38] || keysPressed[39] || keysPressed[40]) {
                        movimiento(keysPressed,this.socket)
                    }
                }
            }, 30);
        },
        cerrar_mapa() {
            this.socket.emit('room_persistent_destroy', {
                idroom: "juego_laberinto",
                type: 'juego_mapa',
            })

            this.socket.emit('room_msg', {
                uniq: "juego_laberinto",
                my_exclude: false,
                persistent: false,
                message: {
                    type: 'cerrar_mapa',
                }
            })

        }
    },
    mounted() {
        // console.log(this.servidor_mapa)
        if (this.servidor_mapa.length == 0) {
            generar(this)
                .then(() => {
                    this.iniciar()
                })
        } else {
            console.log(this.servidor_personaje)
            this.mapa = this.servidor_mapa
            this.personaje = this.servidor_personaje[0].personaje
            this.iniciar()
        }

    }
}
</script>

<style>
body {
    background-color: black
}
</style><style scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Mono:400,700&display=swap');

* {
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
}

body {
    background-color: #031011;
    font-family: 'IBM Plex Mono', monospace;
    color: #ccc;
}

canvas {
    width: 900px;
    height: 900px;
    position: absolute;
    top: 0;
    background-color: black;
}

.container {
    left: 50%;
    top: 50%;
    max-width: 1200px;
    position: absolute;
    transform: translate(-50%, -50%);
}

.side {
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 50%;
}

.title {
    margin-bottom: 10px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
}

.head {
    padding: 5px;
    margin-bottom: 10px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin-top: 5px;
    align-items: flex-start;
}

.col {
    display: flex;
    flex-direction: column;
    width: 25%;
}

input[type="range"] {
    width: 70%;
    cursor: pointer;
}

.info span strong {
    font-size: 20px;
}

.row span {
    font-size: 12px;
    margin-right: 10px;
}

.row .col span:before {
    content: "";
    width: 10px;
    height: 10px;
    display: inline-block;
    margin-right: 5px;
    background-color: #0BF8F1;
    vertical-align: middle;
}

.row p {
    display: inline;
    font-size: 14px;
    vertical-align: middle;
}

.button {
    width: 100%;
    padding: 5px;
    text-align: center;
    border: 3px solid #0BF8F1;
    color: #0BF8F1;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    margin-top: 5px;
}

.button:hover {
    background-color: #0BF8F1;
    color: #031011;
}
</style>
