import Phaser from "phaser";

// import mapa_json from '../assets/img/isometric-grass-and-water.json'
// import tiles from '../assets/img/isometric-grass-and-water.png'
import skeleton from '../assets/img/skeleton8.png'
import house from '../assets/img/rem_0002.png'
import fantasma from '../assets/img/mapa1/Enemigos/fantasmas.png'
import kirby from '../assets/img/mapa1/Personaje/kirby.png'

import mapa from '../assets/img/mapa1/Tiles/mapa_mini.png'
import mapa_borde from '../assets/img/mapa1/Tiles/borde.png'
// import { for } from "core-js/fn/symbol";

// import JoyStick from '../assets/js/joy.js'

function generar(socket,usuario,mapa_estructura){
    
    var config = {
        type: Phaser.WEBGL,
        scale: {
            mode: Phaser.Scale.RESIZE,
            parent: 'game',
            width: '100%',
            height: '100%'
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };


    var icono_fantasma = []
    icono_fantasma['👻'] = []
    icono_fantasma['👻'][1]={
        f : 12,
        f1 : 12,
        f2 : 17,
    }
    icono_fantasma['👻'][2]={
        f : 24,
        f1 : 24,
        f2 : 29,
    }
    icono_fantasma['👽'] = []
    icono_fantasma['👽'][1]={
        f : 66,
        f1 : 66,
        f2 : 71,
    }
    icono_fantasma['👽'][2]={
        f : 78,
        f1 : 78,
        f2 : 83,
    }  
    icono_fantasma['🤬'] = []
    icono_fantasma['🤬'][1]={
        f : 18,
        f1 : 18,
        f2 : 23,
    }
    icono_fantasma['🤬'][2]={
        f : 30,
        f1 : 30,
        f2 : 35,
    }    

    new Phaser.Game(config);

    var skeletons = [];
    var jugadores = []
    var npcs = []
    var scene;
    var cursors;
    var size = {
        x:0,
        y:0
    };

    function preload() {
        this.scale.on('resize', resize, this);
        this.load.spritesheet('skeleton', skeleton, {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('mapa', mapa, {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('fantasma',fantasma,{
            frameWidth: 48,
            frameHeight: 48
        })

        this.load.spritesheet('kirby',kirby,{
            frameWidth: 113,
            frameHeight: 148
        })

        this.load.image('house', house);
        this.load.image('mapa_borde',mapa_borde);
    }

    function create() {
        let { width, height } = this.sys.game.canvas;

        this.mapa_vector = []
        this.visibilidad = []
        this.casas = []

        scene = this;
        size.x = width
        size.y = height

        
        this.cameras.main.setSize(width,height);
        
        mapa_estructura.map((data,x)=>{
            data.map((data_,y)=>{
                if (data_.t!=0){
                    if (!this.mapa_vector[x]) this.mapa_vector[x]= []
                    if (data_.t==1 || data_.t==2 || ["💀", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺","😃"].indexOf(data_.t)>=0) this.mapa_vector[x][y] = this.add.image(x * 64, y * 64, 'mapa', 8).setTint(0x2E7D32);
                    if (data_.t==3) this.mapa_vector[x][y] = this.add.image(x * 64, y * 64, 'mapa_borde', 10);
                    this.mapa_vector[x][y].alpha = 0.1;
                    this.mapa_vector[x][y].cambio = false
                }
            })
        })

        // ********************************************************************************************************************************
        // ********************************************************************************************************************************
        // ********************************************************************************************************************************
        socket.on('actualizacion_usuario', (data) => {
            this.mapa_vector.map(data=>{
                data.filter(data_=>data_.cambio).map(data_=>{
                    data_.alpha=0.1
                    data_.cambio=false
                })
            })
            this.visibilidad = []

            jugadores[usuario].update('walk', data.posicion.pos.x * 64, data.posicion.pos.y * 64)
            
            data.visibilidad.map(data=>{
                if(!this.visibilidad[data.x]) this.visibilidad[data.x] = []
                this.visibilidad[data.x][data.y]= data.visible
                if (this.mapa_vector[data.x][data.y]) {
                    this.mapa_vector[data.x][data.y].alpha = data.visible                    
                    this.mapa_vector[data.x][data.y].cambio = true
                }
            })
        })

        // ********************************************************************************************************************************
        // ********************************************************************************************************************************
        // ********************************************************************************************************************************
        let primera_carga = false
        let objetos = []
        socket.on('actualizacion_usuarios',(data)=>{
            if (primera_carga==false){
                data.npcs.map(data=>{
                    npcs.push(this.add.existing(new Skeleton(this, data.x * 64, data.y * 64, 'idle', 'northWest', 0,data.npc)));
                    //creando registro de casa
                    if (data.npc=='🌲') {
                        this.casas[npcs.length-1] = {
                            img:this.add.image( data.x * 64, data.y * 64, 'house').setScale(0.7, 0.7),
                            rectangulo : scene.add.rectangle( data.x * 64, ((data.y * 64)+95), 100, 10, 0x6666ff),
                            porcentaje : scene.add.rectangle( (data.x * 64)-50, ((data.y * 64)+95), 0, 10, 0x4CAF50)
                        }
                        this.casas[npcs.length-1].img.depth = house.y + 86;
                        this.casas[npcs.length-1].img.alpha = 0;
                        this.casas[npcs.length-1].img.setDepth(1); 
                    }
                })
            }else{
                data.npcs.map((data_,index)=>{  
                    let visible = 0
                    if (this.visibilidad[parseInt(npcs[index].x/64)] && this.visibilidad[parseInt(npcs[index].x/64)][parseInt(npcs[index].y/64)]){
                        visible = this.visibilidad[parseInt(npcs[index].x/64)][parseInt(npcs[index].y/64)]
                    }else{
                        visible = 0
                    }
                    if (data_.npc != "🌲")  {
                        npcs[index].update('walk', data_.x * 64, data_.y * 64,visible)   
                    } else {
                        if (this.casas[index]) {
                            // console.log(visible)
                            this.casas[index].img.alpha  =  visible
                            this.casas[index].rectangulo.setAlpha(visible)
                            this.casas[index].porcentaje.setAlpha(visible)
                        }
                    }
                    
                })
            }

            primera_carga = true

            data.usuarios.map(data=>{
                // console.log(data.objetos)
                if (!jugadores[data.usuario]){
                    jugadores[data.usuario]=this.add.existing(new Jugador(data.usuario,this,  data.pos.x * 64, data.pos.y * 64, 'idle'));
                }else{
                    jugadores[data.usuario].update('walk', data.pos.x * 64, data.pos.y * 64)
                }
                if (jugadores[data.usuario].vida != data.vida) jugadores[data.usuario].actualizar_vida(data.vida)
                if (jugadores[data.usuario].objetos_completados!= data.objetos_completados) jugadores[data.usuario].actualizar_objetos(data.objetos_completados)

                // console.log(data.usuario,objetos)
                if (data.usuario==usuario){
                    for (const key in data.objetos) {
                        if (data.objetos[key]!=null && !objetos[key]){
                            // npcs[key].actualizar_objetivo(data.objetos[key])
                            this.casas[key].porcentaje.setSize( data.objetos[key] * 100 / 30, 10)
                        }
                        if(data.objetos[key]==30 && !objetos[key]){
                            this.casas[key].img.setTint(0x004c99)
                            objetos[key] = true
                        } 
                    }
                    // data.objetos
                    // objetos[]
                }
            })
        })

        // ********************************************************************************************************************************
        // ********************************************************************************************************************************
        // ********************************************************************************************************************************

        var Skeleton = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize: function Skeleton(scene, x, y, motion, direction, distance,icono) {
                this.startX = x;
                this.startY = y;
                this.distance = distance;

                this.motion = motion;
                // this.anim = anims[motion];
                // this.direction = directions[direction];
                this.direccion = 0; //1 = izquierda / 2 = derecha
                this.f = 12
                this.f1 = 12
                this.f2 = 17
                // this.f = this.anim.startFrame;
                this.alpha=0
                this.icono = icono

                // if (icono != "🌲") {
                    Phaser.GameObjects.Image.call(this, scene, x, y, 'fantasma',0);
                    // this.info = scene.add.text(x, y-1,icono);

                    this.depth = y + 64;

                    scene.time.delayedCall(150, this.changeFrame, [], this);
                // } 
            },

            changeFrame: function () {
                this.f++;
                if (this.f > this.f2) this.f = this.f1
                // console.log(this.f)
                this.frame = this.texture.get(this.f);
                scene.time.delayedCall(150, this.changeFrame, [], this);
            },

            update: function (motion,x,y,visible) {
                this.motion = motion
                this.alpha =visible
                
                let icono = (icono_fantasma[this.icono])?this.icono:'👻'

                if (this.x>x && this.direccion!=1){
                    this.f = icono_fantasma[icono][1].f
                    this.f1 =  icono_fantasma[icono][1].f1
                    this.f2 =  icono_fantasma[icono][1].f2
                    this.direccion = 1
                }
                if (this.x<x && this.direccion!=2){
                    this.f = icono_fantasma[icono][2].f
                    this.f1 =  icono_fantasma[icono][2].f1
                    this.f2 =  icono_fantasma[icono][2].f2
                    this.direccion = 2
                }
                
                if (this.motion === 'walk') {
                    this.x = x
                    this.y = y
                    this.depth = this.y + 64;
                }
            }, 
        });


        // ********************************************************************************************************

        var Jugador = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize: function Jugador(usuario,scene, x, y, motion) {
                this.startX = x;
                this.startY = y;

                this.cameras = scene.cameras

                this.motion = motion;
                this.offset = 224
                this.speed = 0.15;
                this.f  = 0
                // this.f = this.anim.startFrame;
                this.usuario = usuario

                this.completados  = 0

                Phaser.GameObjects.Image.call(this, scene, x, y, 'skeleton', 0);
                // this.jugador.setCollideWorldBounds(true);
                this.vida = 100
                this.vidas = 3
                this.vida_icono = "❤"
                this.info = scene.add.text(x, y-1,this.usuario.split('_')[1] +" - " + this.vida_icono.repeat(this.vidas) + this.vida);

                this.depth = y + 64;

                scene.time.delayedCall(1000, this.changeFrame, [], this);
            },

            changeFrame: function () {
                this.f++;
                if (this.f > 20) this.f = 0
                this.frame = this.texture.get(this.f);
                scene.time.delayedCall( 1000, this.changeFrame, [], this);
                // }
            },

            resetAnimation: function () {
                this.f = this.anim.startFrame;

                this.frame = this.texture.get(this.offset + this.f);

                scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
            },

            update: function (motion, x, y) {
                if (this.motion != motion) {
                    // this.f = this.anim.startFrame;
                    this.motion = motion
                    this.changeFrame
                    if (motion == 'idle') return false
                }

                if (motion === 'walk') {
                    this.x = x
                    this.y = y-30
                    
                    this.depth = this.y + 64;
                    if (this.usuario==usuario){
                        this.cameras.main.scrollX = this.x - (size.x / 2)
                        this.cameras.main.scrollY = this.y - (size.y / 2)
                    }else{
                        // ocultando jugador
                        if (scene.visibilidad[parseInt(x/64)] && scene.visibilidad[parseInt(x/64)][parseInt(y/64)]){
                            this.alpha=scene.visibilidad[parseInt(x/64)][parseInt(y/64)]
                        }else{
                            this.alpha=0
                        }
                        this.info.alpha = this.alpha
                    }                    
                    this.info.x = x-3
                    this.info.y = y-3
                    this.info.text =this.usuario.split('_')[1] + " "+ this.vida_icono.repeat(this.vidas) + " "  + parseInt(this.vida) + ' ('+this.completados+')'
                }
            },

            actualizar_vida:function(vida){
                this.vida = vida
                if (vida==100) this.vidas --
                this.info.text =this.usuario.split('_')[1] +" " + this.vida_icono.repeat(this.vidas) + " "  + parseInt(this.vida)+ ' ('+this.completados+')'
            },

            actualizar_objetos:function(completados){
                this.completados = completados
                this.info.text =this.usuario.split('_')[1] +" " + this.vida_icono.repeat(this.vidas) + " "  + parseInt(this.vida) + ' ('+this.completados+')'
            }
        });

        jugadores[usuario]=this.add.existing(new Jugador(usuario,this, 240, 290, 'idle'));

        cursors = this.input.keyboard.createCursorKeys();
    }


    function resize(gameSize) {
        var width = gameSize.width;
        var height = gameSize.height;
        size.x = width
        size.y = height
        this.cameras.resize(width, height);
    }

    function update() {
        skeletons.forEach(function (skeleton) {
            skeleton.update();
        });

        // return;
        let left=false,right=false,top=false,bottom=false
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            if (cursors.left.isDown) {
                left = true
            } else if (cursors.right.isDown) {
                right = true
            }
            if (cursors.up.isDown) {
                top=true
            } else if (cursors.down.isDown) {
                bottom=true
            }
            socket.emit('usuario_movimiento',{ left:left,top:top,right:right,bottom:bottom})
        }

        if (cursors.space.isDown)jugadores[0].update('attack', 0, 0)

        
    }

}

export {generar}