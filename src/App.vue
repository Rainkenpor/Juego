<template>
<div id="app">

    <button @click="cargar_mapa">Cargar Mapa</button>

    <mapa v-if="mostrar_mapa" :socket="socket" :servidor_mapa="servidor_mapa" :servidor_personaje="servidor_personaje"  :usuario="nombre"/>

    <!-- <img class="personaje" :src="require(`./assets${carpeta+nombre}`)" :style="{'left':left+'px'}"> -->

</div>
</template>

<script>
import mapa from './components/Mapa.vue'
import io from 'socket.io-client';
// import kevin from './components/Kevin.vue'
// import sherlyn from './components/Sherlyn.vue'
// import yeimi from './components/Yeimi.vue'

export default {
    name: 'App',
    data() {
        return {
            nombre: null,
            mostrar_mapa: false,
            servidor_mapa: [],
            servidor_personaje: null,

            left: 0,

            tiempo_atacar: null,
            tiempo_morir: null,
            tiempo_esperar: null,
            tiempo_caminar: null,

            socket: null,
        }
    },
    components: {
        mapa,
        // kevin,
        // sherlyn,
        // yeimi
    },
    methods: {
        cargar_mapa() {
            this.mostrar_mapa = true
        },

        iniciar_socket() {
            this.socket = io('https://www.dinnger.com:4003');
            this.socket.on('connect', () => {
                console.log('conectado...')
                // console.log(e)
                var date = new Date();
                this.nombre = date.getTime() + '_' + this.nombre
                let temp_session = {
                    user_id: 493,
                    full_name: this.nombre
                }
                this.socket.emit('set_verify_user', temp_session)
            });

            this.socket.on('get_verify_user', () => {
                this.socket.emit('room_new', {
                    id: "juego_laberinto",
                    name: "juego movimiento",
                    min_role: 2 //role superior
                })

                this.socket.emit('room_assign', {
                    uniq: "juego_laberinto",
                    role_id: 2 //role superior
                })

            })


            this.socket.emit("room_persistent", "juego_laberinto")

            this.socket.on('room_msg_juego_laberinto', (data) => {
                
                if (data.message.type == 'cerrar_mapa') {
                    this.servidor_mapa = []
                    this.servidor_personaje = null
                    this.mostrar_mapa = false
                }


                if (data.message.type=='personaje'){
                    console.log(data.message)
                }
            })

            this.socket.on('room_persistent_juego_laberinto', (data) => {
                //entrando a la sala
                if (data && data.length > 0) {
                    let arr = data.filter(data => data.message.type == 'juego_mapa')
                    if (arr.length > 0) {
                        this.servidor_mapa = arr[0].message.mapa
                        this.servidor_personaje = arr[0].message.personaje
                        this.mostrar_mapa = true
                    }
                }
                
            });

            // this.socket.on('event', function (data) {});
            // this.socket.on('disconnect', function () {});
        }
    },
    mounted() {

        while (this.nombre == null || this.nombre.trim()=="") {
            this.nombre = prompt("Nombre del Jugador", "")
        }

        this.iniciar_socket()
    }

}
</script>

<style>
body {
    margin: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    /* background-image: url('https://cdnb.artstation.com/p/assets/images/images/008/107/625/large/henrique-percu-oliveira-highresscreenshot00002.jpg?1510540979'); */
}

.personaje {
    height: 150px;
    position: absolute;
    top: 0
}
</style>
