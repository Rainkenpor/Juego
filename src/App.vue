<template>
<div id="app">

    <!-- <img class="personaje" :src="require('./assets/fondo.png')" style="width:100%;height:100%" > -->
    <div v-if="!mostrar_mapa">
        <div class="mapas">
            <div class="crear" v-if="crear" @click="crear_mapa" >Crear Mapa</div>
            <div v-for="(item,index) in mapas" :key="index" class="item" @click="cargar_mapa(item.id)">
                {{item.nombre}}
            </div>
        </div>
    </div>
    <mapa v-else :socket="socket" :servidor_mapa="servidor_mapa" :servidor_inicio="servidor_inicio" :usuario="nombre" />

    <!-- <audio ref="audio_fondo"  autoplay loop><source :src="require(`./assets/sound/fondo.wav`)" type="audio/wav" /></audio> -->

</div>
</template>

<script>
import fondo from './assets/fondo.png'
import mapa from './components/Mapa.vue'
import {
    generar
} from './components/Generador.js'
import io from 'socket.io-client';
// import kevin from './components/Kevin.vue'
// import sherlyn from './components/Sherlyn.vue'
// import yeimi from './components/Yeimi.vue'

export default {
    name: 'App',
    // meta: {  bgImage: fondo },
    data() {
        return {
            nombre: null,
            mostrar_mapa: false,
            servidor_mapa: [],
            servidor_inicio: null,

            left: 0,

            tiempo_atacar: null,
            tiempo_morir: null,
            tiempo_esperar: null,
            tiempo_caminar: null,

            crear:false,

            socket: null,

            mapas: []
        }
    },
    components: {
        mapa,
        // kevin,
        // sherlyn,
        // yeimi
    },
    methods: {

        iniciar_socket() {
            // this.socket = io('https://www.dinnger.com:4003');
            // this.socket = io('http://192.168.1.113:3000');
            this.socket = io('http://54.205.110.51:3000');
            // this.socket = io('http://192.168.232.81:3000');
            this.socket.on('connect', () => {
                this.socket.emit('registrar_usuario', this.nombre)
            });

            this.socket.on('listado_mapas', (mapas) => {
                this.crear = mapas.length==0
                this.mapas = mapas
            })

            // MAPA
            // cargar mapa
            this.socket.on('cargar_mapa', (data) => {
                this.servidor_mapa = data.mapa
                this.servidor_inicio = data.inicio
                this.mostrar_mapa = true
            })

            // this.socket.on('cargar_mapa', (data) => {
            //     this.servidor_mapa = data.mapa
            //     this.servidor_inicio = data.inicio
            //     this.mostrar_mapa = true
            // })

            // this.socket.emit("room_persistent", "juego_laberinto")

            // this.socket.on('room_msg_juego_laberinto', (data) => {
            //     if (data.message.type == 'cerrar_mapa') {
            //         this.servidor_mapa = []
            //         this.servidor_inicio = null
            //         this.mostrar_mapa = false
            //     }
            // })

            // this.socket.on('room_persistent_juego_laberinto', (data) => {
            //     //entrando a la sala
            //     if (data && data.length > 0) {
            //         // console.log(data)
            //         let arr = data.filter(data => data.message.type == 'juego_mapa')
            //         if (arr.length > 0) {
            //             this.servidor_mapa = arr[0].message.mapa
            //             this.servidor_inicio = arr[0].message.inicio
            //             this.mostrar_mapa = true
            //         }

            //     }

            // });

            // this.socket.on('event', function (data) {});
            // this.socket.on('disconnect', function () {});
        },

        crear_mapa() {
            this.crear=false
            let nombre = prompt("Nombre del Mapa", "").substring(0, 50)
            if (nombre != null && nombre.trim() != "") {
                generar()
                    .then(resp => {
                        // console.log(resp.inicios)
                        // console.log(resp.inicio)
                        this.socket.emit('crear_mapa', {
                            nombre: nombre.trim(),
                            mapa: resp.mapa,
                            inicio: resp.inicio,
                            inicios: resp.inicios,
                            min_usuarios:2,
                            max_usuarios:50
                        })
                    })
            }
        },

        cargar_mapa(id) {
            this.socket.emit('cargar_mapa', id)
        }
    },
    mounted() {

        document.body.style.backgroundImage = `url(${fondo})`;

        this.nombre = localStorage.getItem('nombre');
        while (this.nombre == null || this.nombre.trim() == "") {
            this.nombre = prompt("Nombre del Jugador", "").substring(0, 10)
            var date = new Date();
            this.nombre = date.getTime() + '_' + this.nombre
            localStorage.setItem('nombre', this.nombre);
        }

        this.iniciar_socket()

        // this.$refs["audio_fondo"].volume = 0.3;
    }
}
</script>

<style>
@font-face {
    font-family: fuente;
    src: url(./assets/font/Scream.ttf);
}

.crear{
    display: inline;
    margin: auto;
    padding:15px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 0px 20px rgba(96, 125, 139, 1);
    cursor: pointer;
}

body {
    margin: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    font-family: fuente;
    /* background-image: url(${to.meta.bgImage}); */
}

.personaje {
    height: 150px;
    position: absolute;
    top: 0
}

.mapas {
    background-color: white;
    box-shadow: 0px 0px 20px rgba(96, 125, 139, 1);
    padding: 20px;
    position: relative;
    margin: auto;
    margin-top: 20px;
    width: 80%;
    border-radius: 20px;
}

.mapas .item {
    padding: 5px;
    font-size: 18px;
    cursor: pointer;
}

.mapas .item:hover {
    text-shadow: 0 0 10px rgba(0,0,0,0.2);
}
</style>
