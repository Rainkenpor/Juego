<template>
<div>

    <button v-if="mostrar_finalizar" @click="cerrar_mapa" style="position: absolute; top: 0px;left:100px;z-index: 99;background-color: black;border: 1px solid #111;">Cerrar Mapa</button>
    <div style="color:white;font-size:20px" v-if="!visible_canvas">
        Cargando...
    </div>

    <div style="position:absolute;width:100%;height:100%;overflow:hidden">
        <canvas width="900" height="900" class="screen" :style="{'transform': 'scale('+((joystick_)?0.5:1)+')'}" v-show="visible_canvas"></canvas>
    </div>

    <div id="game"></div>

    <div style="background-color:white;position:absolute;" v-show="false">
        <img id="muro" :src="require(`../assets/mapa/Tiles/muro.png`)">
        <img id="piso" :src="require(`../assets/mapa/Tiles/grama.png`)">
        <img id="camino" :src="require(`../assets/mapa/Tiles/grama.png`)">

        <img id="caja" :src="require(`../assets/mapa/Objects/Boxes/1.png`)">

        <img id="arbusto" :src="require(`../assets/mapa/Objects/Bushes/4.png`)">
        <img id="arbol" :src="require(`../assets/mapa/Objects/Ridges/4.png`)">
        <img id="arbol2" :src="require(`../assets/mapa/Objects/Willows/1.png`)">
        <img id="roca" :src="require(`../assets/mapa/Objects/Stones/1.png`)">

        <audio  ref="sonido_pasos" controls loop><source :src="require(`../assets/sound/pasos.wav`)" type="audio/wav" /></audio>
        
        <!-- <img id="camino" :src="require(`../assets/mapa/Tiles/Tile_58.png`)"> -->
        <!-- {{personaje}} -->
    </div>
    

    <div style="position:absolute;bottom:10px;right:10px">
        <button v-if="joystick_==false" @click="mostrar_joystick" style="padding:5px">JoyStick</button>
        <div v-show="joystick_" id="joyDiv" style="width:100px;height:100px"></div>
    </div>

</div>
</template>

<script>
// import {
//     inicializar,
//     movimiento,
//     actualizar,
//     actualizar_joystick
// } from './Generador_Movimiento.js'

import {generar} from './Generador_Cliente.js'

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
                y: 0,
                estados:[]
            },
            jugadores: [],
            joystick_: true,
            visible_canvas: false,
            mostrar_finalizar: false,
            nombre_usuario: null,

            cliente:null
        }
    },
    props: {
        socket: {
            default: null
        },
        servidor_mapa: {
            default: []
        },
        servidor_inicio: {
            default: null
        },
        usuario: {
            default: null
        }
    },
    methods: {
        iniciar() {
            // inicializando mapa
            // inicializar(this, this.socket)
            this.joystick_ = false
            this.visible_canvas = true
            let keysPressed = []
            this.camara.x = (17 - (this.personaje.x * 2))
            this.camara.y = (17 - (this.personaje.y * 2))

            // actualización de camara
            // actualizar()

            if (this.servidor_inicio == null) {
                // console.log('iniciando')
                this.socket.emit('room_msg', {
                    uniq: "juego_laberinto",
                    my_exclude: false,
                    persistent: true,
                    message: {
                        type: 'juego_mapa',
                        mapa: this.mapa,
                        inicio: this.personaje
                    }
                })
            }

            this.mostrar_finalizar = true

            // document.addEventListener('keydown', (event) => {
            //     this.$refs["sonido_pasos"].play()
                
            //     keysPressed[event.keyCode] = true;
            // });

            // document.addEventListener('keyup', (event) => {
            //     this.$refs["sonido_pasos"].pause()
            //     delete keysPressed[event.keyCode];
            // });

            var joy = new JoyStick('joyDiv');

            setInterval(() => {
                if (!this.joystick_) {
                    if (keysPressed[37] || keysPressed[38] || keysPressed[39] || keysPressed[40]) {
                        // movimiento(keysPressed, this.socket)
                    }
                } else {
                    delete keysPressed[37]
                    delete keysPressed[38]
                    delete keysPressed[39]
                    delete keysPressed[40]
                    let p = joy.GetDir();

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
                        this.socket.emit('usuario_movimiento',{ left:keysPressed[37],top:keysPressed[38],right:keysPressed[39],bottom:keysPressed[40]}) 
                    }
                }
                // actualizar()
            }, 40)

        },
        cerrar_mapa() {
            //destruyendo datos persistentes
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

        },

        mostrar_joystick(){
            this.joystick_=true;
            // actualizar_joystick(false)
        }
    },
    mounted() {
        // console.log(this.servidor_mapa)
        this.nombre_usuario = this.usuario

        // console.log(this.servidor_mapa)
        this.mapa = this.servidor_mapa
        this.personaje = this.servidor_inicio
        // console.log( this.servidor_inicio)
        this.iniciar()
        this.cliente = generar(this.socket,this.usuario,this.servidor_mapa)

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
    /* background-color: #031011; */
    font-family: 'IBM Plex Mono', monospace;
    color: #ccc;
}

canvas {
    width: 1000px;
    height: 1000px;
    position: absolute;
    top:  -9999px;
    left: -9999px;
    right: -9999px;
    bottom: -9999px;
    margin: auto;
    /* position: absolute;
    top: 0; */
    /* background-color: black; */
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
