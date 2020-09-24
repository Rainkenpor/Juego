function generar (){
    let el = {
        mapa:[],
        personaje:{
            x:0,
            y:0
        }
    }
    return new Promise(resolve=>{

        var __spreadArrays = this && this.__spreadArrays || function () {
            for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
            for (var r = Array(s), k = 0, i2 = 0; i2 < il; i2++)
                for (var a = arguments[i2], j = 0, jl = a.length; j < jl; j++, k++)
                    r[k] = a[j];
            return r;
        };
        //some cool resources
        //		http://roguebasin.roguelikedevelopment.org/index.php?title=Basic_BSP_Dungeon_generation
        //		https://eskerda.com/bsp-dungeon-generation/
        // ---------------- Path
        var Path = /** @class */ function () {
            function Path(x1, y1, x2, y2, w, h) {
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;
                this.w = w;
                this.h = h;
            }
            return Path;
        }();
        // ---------------- Room
        var Room = /** @class */ function () {
            function Room(x, y, w, h) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }
            return Room;
        }();
        // ---------------- Node_
        var SplitDirection;
        (function (SplitDirection) {
            SplitDirection[SplitDirection["VERTICAL"] = 0] = "VERTICAL";
            SplitDirection[SplitDirection["HORIZONTAL"] = 1] = "HORIZONTAL";
        })(SplitDirection || (SplitDirection = {}));
        var Node_ = /** @class */ function () {
            function Node_(chunk, RNG) {
                this.chunk = chunk;
                this.left = null;
                this.right = null;
                this.room = null;
                this.paths = [];
                this.splitDirection = SplitDirection.VERTICAL;
                this.isSplit = false;
                this.RNG = RNG;
            }
            Node_.prototype.random = function (min, max) {
                return Math.floor(this.RNG() * (max - min)) + min;
            };
            Node_.prototype.split = function (iterationCount) {
                this.isSplit = true;
                this.splitDirection =
                    this.RNG() > 0.5 ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;
                var ratio = this.chunk.w / this.chunk.h;
                if (ratio <= this.chunk.minRatio) {
                    this.splitDirection = SplitDirection.HORIZONTAL;
                } else
                if (ratio >= this.chunk.maxRatio) {
                    this.splitDirection = SplitDirection.VERTICAL;
                }
                var shiftOffset = this.splitDirection == SplitDirection.VERTICAL ?
                    this.random(-this.chunk.w / 4, this.chunk.w / 4) :
                    this.random(-this.chunk.h / 4, this.chunk.h / 4);
                this.left = new Node_({
                        x: this.chunk.x,
                        y: this.chunk.y,
                        w: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.w / 2 + shiftOffset : this.chunk.w,
                        h: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.h : this.chunk.h / 2 + shiftOffset,
                        minRatio: this.chunk.minRatio,
                        maxRatio: this.chunk.maxRatio,
                        minWidth: this.chunk.minWidth,
                        minHeight: this.chunk.minHeight
                    },
                    this.RNG);
                this.right = new Node_({
                        x: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.x + this.chunk.w / 2 + shiftOffset : this.chunk.x,
                        y: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.y : this.chunk.y + this.chunk.h / 2 + shiftOffset,
                        w: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.w / 2 - shiftOffset : this.chunk.w,
                        h: this.splitDirection == SplitDirection.VERTICAL ?
                            this.chunk.h : this.chunk.h / 2 - shiftOffset,
                        minRatio: this.chunk.minRatio,
                        maxRatio: this.chunk.maxRatio,
                        minWidth: this.chunk.minWidth,
                        minHeight: this.chunk.minHeight
                    },
                    this.RNG);
                if (iterationCount > 0) {
                    if (this.left.chunk.w > this.left.chunk.minWidth &&
                        this.left.chunk.h > this.left.chunk.minHeight) {
                        this.left.split(iterationCount - 1);
                    }
                    if (this.right.chunk.w > this.right.chunk.minWidth &&
                        this.right.chunk.h > this.right.chunk.minHeight) {
                        this.right.split(iterationCount - 1);
                    }
                }
            };
            Node_.prototype.generateRooms = function () {
                if (!this.isSplit) {
                    var x = Math.floor(this.chunk.x + this.random(this.chunk.w * 0.2, this.chunk.w * 0.25));
                    var y = Math.floor(this.chunk.y + this.random(this.chunk.h * 0.2, this.chunk.h * 0.25));
                    var w = Math.floor(this.random(this.chunk.w * 0.6, this.chunk.w * 0.7));
                    var h = Math.floor(this.random(this.chunk.h * 0.6, this.chunk.h * 0.7));
                    
                    this.room = new Room(x, y, w, h);
                }
                if (this.left != null) {
                    this.left.generateRooms();
                }
                if (this.right != null) {
                    this.right.generateRooms();
                }
            };
            Node_.prototype.constructPath = function (a, b, direction, pathWidh) {
                var x1 = Math.floor(a.x);
                var y1 = Math.floor(a.y);
                var x2 = Math.floor(b.x);
                var y2 = Math.floor(b.y);
                var w = direction == SplitDirection.VERTICAL ? x2 - x1 : pathWidh;
                var h = direction == SplitDirection.VERTICAL ? pathWidh : y2 - y1;
                return new Path(x1, y1, x2, y2, w, h);
            };
            Node_.prototype.createPaths = function () {
                if (this.left != null && this.right != null) {
                    this.paths.push(this.constructPath({
                            x: this.left.chunk.x + this.left.chunk.w / 4,
                            y: this.left.chunk.y + this.left.chunk.h / 4
                        }, {
                            x: this.right.chunk.x + this.right.chunk.w / 1.5,
                            y: this.right.chunk.y + this.right.chunk.h / 1.5
                        },
                        this.splitDirection, 1));
                    this.left.createPaths();
                    this.right.createPaths();
                }
            };
            Node_.prototype.getChunks = function () {
                var chunkArr = [this.chunk];
                if (this.left != null && this.right != null) {
                    chunkArr = __spreadArrays(chunkArr, this.left.getChunks(), this.right.getChunks());
                }
                return chunkArr;
            };
            Node_.prototype.getRooms = function () {
                var roomArr = [];
                if (this.room != null) {
                    roomArr.push(this.room);
                }
                if (this.left != null && this.right != null) {
                    roomArr = __spreadArrays(roomArr, this.left.getRooms(), this.right.getRooms());
                }
                return roomArr;
            };
            Node_.prototype.getPaths = function () {
                var pathArr = this.paths;
                if (this.left != null && this.right != null) {
                    pathArr = __spreadArrays(pathArr, this.left.getPaths(), this.right.getPaths());
                }
                return pathArr;
            };
            return Node_;
        }();
        // ---------------- Visualization
        var Visualization = /** @class */ function () {
            function Visualization(root, map, canvas, ctx, font, mobCount, mobChars, index, chars, colors) {
                var _this = this;
                this.root = root;
                this.map = map;
                this.canvas = canvas;
                this.ctx = ctx;
                this.font = font;
                this.mobCount = mobCount;
                this.mobChars = mobChars;

                this.index = index;
                this.chars = chars;
                this.colors = colors;
                // this.ctx.font = this.font;
                this.frameCounter = 0;
                this.stepCounter = 0;
                this.pathCounter = 0;
                this.roomCounter = 0;
                this.asciiLineCounter = 0;
                this.mobCounter = 0;
                this.paths = this.root.getPaths();
                this.rooms = this.root.getRooms();
                this.scaleX = 2000 / this.root.chunk.w;
                this.scaleY = 2000 / this.root.chunk.h;
                this.mobs = this.getMobs();
                this.steps = [
                    // function () {
                    //     if (_this.pathCounter <= _this.paths.length) {
                    //         for (var i = 0; i < _this.pathCounter; i++) {
                    //             ctx.fillStyle = _this.colors.prePath;
                    //             ctx.fillRect(_this.paths[i].x1 * _this.scaleX, _this.paths[i].y1 * _this.scaleY, _this.paths[i].w * _this.scaleX, _this.paths[i].h * _this.scaleY);
                    //         }
                    //         _this.drawChunkLines();
                    //         _this.pathCounter++; 
                    //     } else {
                    //         _this.stepCounter++;
                    //     }
                    // },
                    // function () {
                    //     if (_this.roomCounter <= _this.rooms.length) {
                    //         for (var i = 0; i < _this.roomCounter; i++) {
                    //             ctx.fillStyle = _this.colors.preRoom;
                    //             ctx.fillRect(_this.rooms[i].x * _this.scaleX, _this.rooms[i].y * _this.scaleY, _this.rooms[i].w * _this.scaleX, _this.rooms[i].h * _this.scaleY);
                    //         }
                    //         _this.drawChunkLines();
                    //         _this.roomCounter++;
                    //     } else {
                    //         _this.stepCounter++;
                    //     }
                    // },
                    function () {
                        if (_this.asciiLineCounter < _this.root.chunk.h) {
                            for (var i = 0; i < map[_this.asciiLineCounter].length; i++) {
                                var tile = map[_this.asciiLineCounter][i];
                            }
                            // _this.drawChunkLines();
                            _this.asciiLineCounter++;
                        } else {
                            // ctx.fillStyle = _this.colors.bg;
                            // ctx.fillRect(0, 0, canvas.width, canvas.height);
                            for (i = 0; i < map.length; i++) {
                                for (var j = 0; j < map[i].length; j++) {
                                    // el.mapa[j] = []
                                    // el.mapa[j][i] = tile
                                    tile = map[i][j];
                                    if (!el.mapa[j]) el.mapa[j] = []
                                    el.mapa[j][i]={t:tile,mostra:false}    
                                }
                            }
                            _this.stepCounter++;
                        }
                    },
                    function () {
                        if (_this.mobCounter < _this.mobs.length) {
                            var mob = _this.mobs[_this.mobCounter];
                            // ctx.fillStyle = _this.colors.bg;
                            // _this.ctx.fillRect(mob.x * _this.scaleX, mob.y * _this.scaleY, _this.scaleX, _this.scaleY);
                            // ctx.textBaseline = "top";
                            // _this.ctx.fillText(mob.char, mob.x * _this.scaleX, mob.y * _this.scaleY);
                            el.mapa[mob.x][mob.y]={t:mob.char,mostrar:false}
                            _this.mobCounter++;
                        } else {
                            _this.stepCounter++;
                            resolve({mapa:el.mapa,inicio:el.personaje})
                        }
                    }
                ];

            }
           
            Visualization.prototype.getFloors = function () {
                var floors = [];
                for (var i = 0; i < this.map.length; i++) {
                    for (var j = 0; j < this.map[i].length; j++) {
                        if ([this.index.room, this.index.path].indexOf(this.map[i][j]) > -1) {
                            floors.push({
                                x: j,
                                y: i
                            });

                        }
                    }
                }
                return floors;
            };
            
            Visualization.prototype.getMobs = function () {
                var mobs = [];
                var floors = this.getFloors();
                var personaje = false
                for (var i = 0; i < this.mobCount; i++) {
                    if (floors.length > 0) {
                        var floor = floors.splice(Math.floor(Math.random() * floors.length), 1)[0];
                        
                        let index = Math.floor(Math.random() * ((personaje==false)?this.mobChars.length:this.mobChars.length-1))
                        
                        if ( this.mobChars[index] == "😃"){
                            // console.log(this.mobChars[index])
                            personaje = true
                            el.personaje.x = floor.x
                            el.personaje.y = floor.y
                        }
                        mobs.push({
                            x: floor.x,
                            y: floor.y,
                            char: this.mobChars[index]
                        });

                    }
                }
                return mobs;
            };
            // Visualization.prototype.drawChunkLines = function () {
            //     var _this = this;
            //     // this.ctx.strokeStyle = this.colors.chunkLine;
            //     // this.ctx.lineWidth = 1;
            //     this.root.
            //     getChunks().
            //     forEach(function (e) {
            //         return _this.ctx.strokeRect(e.x * _this.scaleX, e.y * _this.scaleY, e.w * _this.scaleX, e.h * _this.scaleY);
            //     });
            // };
            Visualization.prototype.tick = function (animDelay) {
                if (this.frameCounter % animDelay == 0 &&
                    this.stepCounter < this.steps.length) {
                    this.steps[this.stepCounter]();
                }
                this.frameCounter++;
            };
            return Visualization;
        }();
        // ---------------- Main
        // var canvas = document.querySelector(".screen") || new HTMLCanvasElement();
        // var ctx = canvas.getContext("2d") || new CanvasRenderingContext2D();
        var RNG = Math.random;
        var v
        var inputs = {
            COL: 40,
            ROW: 40,
            minWHRatio: 0.5,
            maxWHRatio: 2,
            minChunkWidth: 10,
            minChunkHeight: 10,
            iterationCount: 18,
            animDelay: 1    
        };

        // console.log(RNG)
        var reset = function (col, row, minWHRatio, maxWHRatio, minChunkWidth, minChunkHeight, iterationCount) {
            var root = new Node_({
                    x: 0,
                    y: 0,
                    w: col,
                    h: row,
                    minRatio: minWHRatio,
                    maxRatio: maxWHRatio,
                    minWidth: minChunkWidth,
                    minHeight: minChunkHeight
                },
                RNG);
            var map = [];
            for (var i = 0; i < root.chunk.h; i++) {
                map.push([]);
                for (var j = 0; j < root.chunk.w; j++) {
                    map[i].push(0);
                }
            }
            root.split(iterationCount);
            root.generateRooms();
            root.createPaths();
            var rooms = root.getRooms();
            var paths = root.getPaths();
            var placeWalls = function () {
                rooms.forEach(function (room) {
                    var yStart = room.h > 3 ? room.y : room.y - 1;
                    var yTarget = room.h > 3 ? room.y + room.h : room.y + room.h + 1;
                    var xStart = room.w > 3 ? room.x : room.x - 1;
                    var xTarget = room.w > 3 ? room.x + room.w : room.x + room.w + 1;
                    // let yStart = room.y;
                    // let yTarget = room.y + room.h;
                    // let xStart = room.x;
                    // let xTarget = room.x + room.w;
                    for (var i = yStart; i < yTarget; i++) {
                        for (var j = xStart; j < xTarget; j++) {
                            if (i > -1 && i < root.chunk.h && j > -1 && j < root.chunk.w) {
                                map[i][j] = 3;
                            }
                        }
                    }
                });
                paths.forEach(function (path) {
                    for (var i = path.y1 - 1; i < path.y1 + path.h + 1; i++) {
                        for (var j = path.x1 - 1; j < path.x1 + path.w + 1; j++) {
                            if (i > -1 && i < root.chunk.h && j > -1 && j < root.chunk.w) {
                                map[i][j] = 3;
                            }
                        }
                    }
                });
            };
            var placePaths = function () {
                paths.forEach(function (path) {
                    for (var i = path.y1; i < path.y1 + path.h; i++) {
                        for (var j = path.x1; j < path.x1 + path.w; j++) {
                            if (i == 0 || i == root.chunk.h - 1 || j == 0 || j == root.chunk.w - 1) {
                                map[i][j] = 3;
                            } else {
                                map[i][j] = 2;
                            }
                        }
                    }
                });
            };
            var placeRooms = function () {
                rooms.forEach(function (room) {
                    var yStart = room.h > 3 ? room.y + 1 : room.y;
                    var yTarget = room.h > 3 ? room.y + room.h - 1 : room.y + room.h;
                    var xStart = room.w > 3 ? room.x + 1 : room.x;
                    var xTarget = room.w > 3 ? room.x + room.w - 1 : room.x + room.w;
                    // let yStart = room.y + 1;
                    // let yTarget = room.y + room.h - 1;
                    // let xStart = room.x + 1;
                    // let xTarget = room.x + room.w - 1;
                    for (var i = yStart; i < yTarget; i++) {
                        for (var j = xStart; j < xTarget; j++) {
                            if (i == 0 || i == root.chunk.h - 1 || j == 0 || j == root.chunk.w - 1) {
                                map[i][j] = 3;
                            } else {
                                map[i][j] = 1;
                            }
                        }
                    }
                });
            };
            placeWalls();
            placePaths();
            placeRooms();
            v = new Visualization(root, map, null, null, "bold 20px 'IBM Plex Mono', monospace", 50, ["🍎", "🌟", "👻", "👽", "🤡", "🤬", "🌲", "🧠", "🔥", "🥩", "🍺","😃"], {
                wall: 3,
                path: 2,
                room: 1
            }, {
                wall: "#",
                path: "*",
                room: "."
            }, {
                wall: "#0BF8F1",
                asciiPath: "orange",
                prePath: "#A0FFFF",
                asciiRoom: "#4eff3c",
                preRoom: "#FF3CFF",
                chunkLine: "#394244",
                bg: "#031011"
            });

            // ctx.fillStyle = "#031011";
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        var loop = function () {
            v.tick(inputs.animDelay);
            requestAnimationFrame(loop);
        };
        reset(inputs.COL, inputs.ROW, inputs.minWHRatio, inputs.maxWHRatio, inputs.minChunkWidth, inputs.minChunkHeight, inputs.iterationCount);
        loop();
        // ---------------- Dom
        // var generateBtn = document.querySelector(".button") || new HTMLButtonElement();
        // generateBtn.addEventListener("click", function () {
        //     reset(inputs.COL, inputs.ROW, inputs.minWHRatio, inputs.maxWHRatio, inputs.minChunkWidth, inputs.minChunkHeight, inputs.iterationCount);
        // });
        // var sizeInput = document.querySelector(".size") || new HTMLInputElement();
        // sizeInput.addEventListener("input", function () {
        //     inputs.COL = Number(this.value);
        //     inputs.ROW = Number(this.value);
        //     var v_input = document.querySelector("." + this.getAttribute("data-v")) ||
        //         new HTMLParagraphElement();
        //     v_input.innerHTML = this.value;
        // });
        var otherRanges = __spreadArrays(document.querySelectorAll(".range_input")) || [];
        otherRanges.forEach(function (e) {
            e.addEventListener("input", function () {
                var field = this.getAttribute("data-i") || "";
                inputs[field] = Number(this.value);
                var v_input = document.querySelector("." + this.getAttribute("data-v")) ||
                    new HTMLParagraphElement();
                v_input.innerHTML = this.value;
            });
        });
    })
}
export {generar}