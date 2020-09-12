<template>
  <div id="app">
    Proyecto Personal ...

    <Kevin />
    <Sherlyn />
    <Yeimi />


  </div>
</template>

<script>
export default {
  name: 'App',
  components:{
    Kevin: ()=>import('./components/Kevin'),
    Sherlyn: ()=>import('./components/Sherlyn'),
    Yeimi: ()=>import('./components/Yeimi')
  }
  
}
</script>

<style>
</style>
 