<template>
<div id="app">
    <kevin style="z-index: 0;" />
    <sherlyn style="z-index: 1;" />
    <yeimi style="z-index: 2;" />

    <button @click="atacar()">Atacar</button>
    <button @click="morir()">Morir</button>
    <button @click="esperar()">Espera</button>
    <button @click="caminar()">Caminar</button>
    
    <img class="personaje" :src="require(`./assets${carpeta+nombre}`)" :style="{'left':left+'px'}">

</div>
</template>

<script>
import kevin from './components/Kevin.vue'
import sherlyn from './components/Sherlyn.vue'
import yeimi from './components/Yeimi.vue'

export default {
    name: 'App',
    data() {
        return {
            carpeta: '/zombie/male/',
            nombre: 'Attack (1).png',

            left: 0,

            tiempo_atacar: null,
            tiempo_morir: null,
            tiempo_esperar: null,
            tiempo_caminar: null,
        }
    },
    components: {
        kevin,
        sherlyn,
        yeimi
    },
    methods: {
        atacar() {
            let numero = 1
            this.limpiar()
            this.tiempo_atacar = setInterval(() => {
                if (numero > 8) numero = 1
                this.nombre = 'Attack (' + numero + ').png'
                numero++
            }, 100)
        },

        morir() {
            let numero = 1
            this.limpiar()
            this.tiempo_morir = setInterval(() => {
                if (numero > 12) numero = 1
                this.nombre = 'Dead (' + numero + ').png'
                numero++
            }, 100)
        },

        esperar() {
            let numero = 1
            this.limpiar()
            this.tiempo_esperar = setInterval(() => {
                if (numero > 15) numero = 1
                this.nombre = 'Idle (' + numero + ').png'
                numero++
            }, 100)
        },

        caminar() {
            let numero = 1
            this.limpiar()
            this.tiempo_caminar = setInterval(() => {
                this.left+=12
                if (numero > 10) numero = 1
                this.nombre = 'Walk (' + numero + ').png'
                numero++
            }, 100)
        },

        limpiar() {
            clearInterval(this.tiempo_morir)
            clearInterval(this.tiempo_atacar)
            clearInterval(this.tiempo_esperar)
            clearInterval(this.tiempo_caminar)
        }

    }

}
</script>

<style>
body {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: url('https://cdnb.artstation.com/p/assets/images/images/008/107/625/large/henrique-percu-oliveira-highresscreenshot00002.jpg?1510540979');
}

.personaje {
    height: 250px;
    position: relative;
}
</style>
