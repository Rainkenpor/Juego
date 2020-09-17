<template>
<div>

    <div class="contenedor" :style="{'left':left+'px'}">
        <img class="personaje" :src="require(`../assets${carpeta+nombre}`)">
        <div class="vida">
            <div class="total" :style="{'width':vida+'%'}"></div>
        </div>
    </div>

    <button @click="atacar()">Atacar</button>
    <button @click="morir()">Morir</button>
    <button @click="saltar()">Saltar</button>
    <button @click="esperar()">Espera</button>
    <button @click="caminar()">Caminar</button>
    <button @click="correr()">Correr</button>
</div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            carpeta: '/caballero/',
            nombre: 'Attack (1).png',

            left: 900,
            vida:100,

            tiempo_atacar: null,
            tiempo_morir: null,
            tiempo_esperar: null,
            tiempo_saltar: null,
            tiempo_caminar: null,
        }
    },
    methods: {
        atacar() {
            let numero = 1
            this.limpiar()
            this.tiempo_atacar = setInterval(() => {
                if (numero > 10) numero = 1
                this.vida = this.vida - 0.2
                this.nombre = 'Attack (' + numero + ').png'
                numero++
            }, 100)
        },

        morir() {
            let numero = 1
            this.limpiar()
            this.tiempo_morir = setInterval(() => {
                if (numero > 10) numero = 1
                this.nombre = 'Dead (' + numero + ').png'
                numero++
            }, 100)
        },

        esperar() {
            let numero = 1
            this.limpiar()
            this.tiempo_esperar = setInterval(() => {
                if (numero > 10) numero = 1
                this.nombre = 'Idle (' + numero + ').png'
                numero++
            }, 100)
        },

        saltar() {
            let numero = 1
            this.limpiar()
            this.tiempo_saltar = setInterval(() => {
                this.left += 12
                if (numero > 10) numero = 1
                this.nombre = 'Jump (' + numero + ').png'
                numero++
            }, 100)
        },

        caminar() {
            let numero = 1
            this.limpiar()
            this.tiempo_caminar = setInterval(() => {
                this.left = this.left - 12
                if (numero > 10) numero = 1
                this.nombre = 'Walk (' + numero + ').png'
                numero++
            }, 100)
        },

        correr() {
            let numero = 1
            this.limpiar()
            this.tiempo_caminar = setInterval(() => {
                this.left = this.left - 20
                if (numero > 10) numero = 1
                this.nombre = 'Run (' + numero + ').png'
                numero++
            }, 100)
        },

        limpiar() {
            clearInterval(this.tiempo_morir)
            clearInterval(this.tiempo_atacar)
            clearInterval(this.tiempo_saltar)
            clearInterval(this.tiempo_esperar)
            clearInterval(this.tiempo_caminar)
        }

    }

}
</script>

<style scoped>
.contenedor {
    top: 0px;
    position: absolute;
    /* background-color: green; */
    width: 110px;
    height: 170px;
}

.contenedor .vida{
    background-color: #F44336;
    height: 10px;
    /* padding:10px; */
    width:110px;
    position: absolute;
    top:0;
}

.contenedor .vida .total{
    background-color: #4CAF50;
    height: 10px;
    /* padding:10px; */
    position: absolute;
    top:0;
}



.personaje {
    position: relative;
    top:10px;
    left:-20px;
    height: 150px;
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
}
</style>
