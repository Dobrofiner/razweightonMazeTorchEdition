let rdg=state=>((state+0xD0B)*0xD0BD^(0xAEDEAABD-1))>>>0
//todo: make neuron pc
class tilemap{
    constructor(id){
    this.canvas=document.getElementById(id),
    this.width=640
    this.height=480
    this.elements=[[],[],[]]
    this.tileWidth=32
    this.tileHeight=32
    this.tileTypes=[]
    this.isInited=false
    this.tilesSheets=[]
    this.tileImgs=[]
    this.chunkX=1
    this.chunkY=1
    this.nextDuid=0
    this.entities={}
    this.dead=[[],[],[]]
    this.cameraY=0
    this.cameraX=0
    this.scale=1
    this.spatialHash=new Map()
    }
   get drw(){ 
   return this.canvas.getContext("2d")
}

    collectGarbage(){
        this.dead=[[],[],[]]
        let els=[[],[],[]]
                for(let d=0;d<this.elements.length||0;d++){
        for(let e=0;e<this.elements[d].length;e++){
            if(this.elements[d][e]&&this.elements[d][e].alive){
                els[d][els[d].length]=this.elements[d][e]
                els[d][els[d].length-1].arrayIndex=els[d].length-1
            }
        }
    }
        this.elements=els
    }

 processSpriteSheet(img = new Image(),gapX=0,gapY=0,cstW=this.tileWidth,cstH=this.tileHeight,maxTilesX=Infinity,maxTilesY=Infinity,customSizes={}) {//чтоб не страдать добавляю gaps!
    return new Promise((resolve) => {
    let ctx = this;
      if (typeof img == 'string') {
            let src = img; 
            img = new Image(); 
            img.src = src;
        }
        img.onload = function() {
            let cnvs = document.createElement("canvas");
            let drawer = cnvs.getContext("2d");
            cnvs.width = img.naturalWidth;
            cnvs.height = img.naturalHeight;
            
            drawer.drawImage(img, 0, 0);
         //   document.body.appendChild(cnvs);
         let width=img.naturalWidth,height=img.naturalHeight
let tiles=[]
let xDid=0,yDid=0;
let shiftX=cstW+gapX,shiftY=cstH+gapY
let tileId=0
for(let y = 0;y<height;y+=shiftY){
for(let x = 0;x<width;x+=shiftX){
    let cstSizes=customSizes[tileId]
        let canvs = document.createElement("canvas");
        canvs.width=cstSizes?cstSizes[0]:ctx.tileWidth;
        canvs.height=cstSizes?cstSizes[1]:ctx.tileHeight
  let drw=canvs.getContext("2d")
  drw.drawImage(cnvs,x,y,ctx.tileWidth,ctx.tileHeight,0,0,ctx.tileWidth,ctx.tileHeight)
  tiles[tiles.length]=canvs
     if(xDid>=maxTilesX){
        break;
    }
    xDid++
    tileId++
    }
    if(yDid>=maxTilesY||xDid>=maxTilesX){
        break;
    }
    yDid++

}

            resolve([tiles,img]);
        }
        if (!typeof img == 'string') {
            img.onload()
        }
    })
    
}
loadSpriteSheet(img,write=true,index=this.tileImgs.length,gapX=0,gapY=0,cstW=this.tileWidth,cstH=this.tileHeight,maxTilesX=Infinity,maxTilesY=Infinity){
    return this.processSpriteSheet(img,gapX,gapY,cstW,cstH,maxTilesX,maxTilesY).then(result => {
        if(write){
            this.tilesSheets[index] = result[0]; 
            this.tileImgs[index]=result[1]    
        }
        return result;
    })
}

drawSpriteSheet(whereAppend=document.body){
    let canvas2 = document.createElement("canvas")
    canvas2.width=this.tileImgs[0].naturalWidth*1.2
    canvas2.height=this.tileImgs[0].naturalHeight*1.2

    let ddrewer=canvas2.getContext("2d")
    let chunkX = Math.ceil(this.tileImgs[0].naturalWidth / this.tileWidth)
    let chunkY = Math.ceil(this.tileImgs[0].naturalHeight / this.tileHeight)
    console.log(chunkX,chunkY)
    let x=0,y=0
    for(let d = 0;d<this.tilesSheets[0].length;d++){
        console.log(x,y)
        ddrewer.drawImage(this.tilesSheets[0][d],x*this.tileWidth,y*this.tileHeight)
        if(x>=chunkX){
            y+=1
            x=0
        }else{
            x+=1
            
        }

    }
    whereAppend.appendChild(canvas2)
}
draw(){
        if(this.isInited==false||this.width!=this.canvas.width||this.height!=this.canvas.height){

            this.canvas.width=this.width
            this.canvas.height=this.height
            this.isInited=true;
        }
this.drw.clearRect(0,0,this.width,this.height);
for(let d = 0;d<this.elements.length;d++){
    for(let e=0;e<this.elements[d].length;e++){
let el = this.elements[d][e];
if(el.alive&&el.view){
let height=this.tileHeight*el.h
let width=this.tileWidth*el.w
let dx = ((el.x * this.tileWidth+ width / 2) - (this.cameraX))/this.scale
let dy = ((el.y * this.tileHeight+ height / 2) - (this.cameraY))/this.scale
if(dx+width<=this.width+width
    &&dy+height<=this.height+height
    &&dy>=0&&dx>=0){
    if(this.tilesSheets[el.sprN]==undefined){//old mode
let oldColor=this.drw.fillStyle;
this.drw.fillStyle=el.color;
this.drw.fillRect(dx,dy,width/this.scale,height/this.scale)
this.drw.fillStyle=oldColor;
    }else{
  //      console.log(el.tileId)
    this.drw.drawImage(this.tilesSheets[el.sprN||0][el.tileId],dx,dy,width/this.scale,height/this.scale)
    }
}
}
}
}

    }
removeAllEls(excludeTypes){
this.dead=[[],[],[]]
let ells=[]
if(!Array.isArray(excludeTypes)){
    excludeTypes=[excludeTypes]
}
for(let d=0;d<this.elements.length;d++){
    ells[ells.length]=[]
    let fastElls=this.elements[d]
    let tells=ells[d]
for(let e=0;e<fastElls.length;e++){
    if(fastElls[e].alive&&!excludeTypes.includes(fastElls[e].id)){
    this.remEntity(fastElls[e].duid)
    }else{
    tells[tells.length]=fastElls[e]
        tells[tells.length-1].arrayIndex=tells.length-1
    }
}
}
this.dead=[[],[],[]]
this.elements=ells
}
 createTile(color="#000",name='',vars={}){
        let tile={
            color:color,
            name:name,
            x:0,
            y:0,
            alive:true,
            pins:[],
            w:1,
            h:1,
            tileId:this.tileTypes.length*32,
            sprN:0,
            view:true
        }
        for(let d in vars){
            let el = vars[d];
          if(tile[d]==undefined||d=="tileId"||d=="h"||d=="w")tile[d]=el;
        }
    this.tileTypes.push(tile);
    return this.tileTypes.length-1;
    }
    createComplexTileType(tilesOnIn){
    this.tileTypes.push([...tilesOnIn]);
    }
    addComplexTile(id,x,y){
    }
    playAnim(duid,id,frameSt=0,speed=20,maxFrames=this.entities[duid].anim[id].length,nxt){
        let obj=this.entities[duid]
    //    let ms=1000/speed
    clearTimeout(obj.timerId)
        if(obj.playAnim==undefined){
        obj.playAnim=function(frame=frameSt,id,maxFrames,count=0,speed,next){
            let ms=1000/speed
         // console.log(frame,id,this,this.anim[id])
            this.tileId=this.anim[id][frame]
            frame=(frame+1)%this.anim[id].length
            count++
            if(count>=maxFrames){
                clearTimeout(this.timerId)
                if(typeof next == "function"){
                    next()
                }
            }else{
                this.timerId=setTimeout(this.playAnim,ms,frame,id,maxFrames,count,speed,next)
            }
          // engine.draw()
        }.bind(obj)}
        obj.playAnim(frameSt,id,maxFrames,0,speed,nxt)
    }
 remEntity(id){
        let el=this.entities[id]
          if (!el || !el.alive) return false;
          this.#remFromSpatHash(id)
        el.alive=false
        this.dead[el.layer].push(el.arrayIndex)
          delete this.entities[id]

          return true
    }
addTile(id,x,y,layer=0){
        let tileType=this.tileTypes[id];
        if(!tileType){
            return;
        }
        let tile={}
        for(let d in tileType){
            tile[d]=tileType[d];
        }
        tile.alive=true
        tile.duid=this.nextDuid++
        tile.id=id;
        tile.x=x;
        tile.y=y;
        tile.layer=layer
        tile.arrayIndex=this.elements[layer].length
        let index=this.dead[layer].pop()
        if(index==undefined){
            this.elements[layer].push(tile)
        }else{
            this.elements[layer][index]=tile
            tile.arrayIndex=index
        }
        this.entities[tile.duid]=tile
          this.#addToSpatHash(tile.duid)

return tile
}
#addToSpatHash(duid){
    let obj=this.entities[duid]
if(obj){
         let w = obj?.w || 1
        let h = obj?.h || 1
    let x=Math.floor(obj.x),y=Math.floor(obj.y)
        let startX = Math.round(x - (w-1) / 2)
        let startY = Math.round(y - (h-1) / 2)
        let endX = Math.round(x + (w-1) / 2)
        let endY = Math.round(y + (h-1) / 2)

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                let key = x + "," + y
                if (!this.spatialHash.has(key)) this.spatialHash.set(key,new Set())
                    this.spatialHash.get(key).add(duid)
            }
        }
    }
}
#remFromSpatHash(duid) {
    let obj = this.entities[duid]
    let w = obj.w || 1
    let h = obj.h || 1
  let x=Math.floor(obj.x),y=Math.floor(obj.y)
        let startX = Math.round(x - (w-1) / 2)
        let startY = Math.round(y - (h-1) / 2)
        let endX = Math.round(x + (w-1) / 2)
        let endY = Math.round(y + (h-1) / 2)

    for (let y = startY; y <= endY; y+=1) {
        for (let x = startX; x <= endX; x+=1) {
            let key = x + "," + y
            let cell = this.spatialHash.get(key)
            if (cell) {
                cell.delete(duid)  
                if (cell.size === 0) {
                    this.spatialHash.delete(key)
                }
            }
        }
    }
}
getTileByXY(x, y, onlyOne=true,radios=1) {
    let key = Math.floor(x) + "," + Math.floor(y)
    let tiles = this.spatialHash.get(key) || []
    if(onlyOne){
        let id=Array.from(tiles)[0]
        if(id!=undefined&&this.entities[id].alive){
        if(this.isColliding(this.entities[id],{x,y,w:radios,h:radios}))return id
        }
            return undefined
        
    
    }
    return /*sad.values().toArray()[0]*/tiles
}
/*isColliding(actor,target){
        let dx=Math.abs(actor.x-target.x)
        let dy=Math.abs(actor.y-target.y)
        return dx<=0.8&&dy<=0.8  
}*/
isColliding(actor, target) {
   let ax1 = actor.x - actor.w / 2
    let ax2 = actor.x + actor.w / 2
    let ay1 = actor.y - actor.h / 2
    let ay2 = actor.y + actor.h / 2

  let tx1 = target.x - target.w / 2
    let tx2 = target.x + target.w / 2
    let ty1 = target.y - target.h / 2
    let ty2 = target.y + target.h / 2

   return ax1 < tx2 && ax2 > tx1 && ay1 < ty2 && ay2 > ty1
}
moveEntity(duid, x, y) {
    let obj = this.entities[duid];
    if (!obj) return;
    
    let dx = x - obj.x;
    let dy = y - obj.y;
    
    // Если смещения нет — ничего не делаем
    if (dx === 0 && dy === 0) return;

    // Сдвигаем сам объект (без пинов, чтобы не было рекурсии)
    this.#remFromSpatHash(duid);
    obj.x = x;
    obj.y = y;
    this.#addToSpatHash(duid);

    // Сдвигаем все привязанные объекты на ту же дельту
    for (let d = 0; d < obj.pins.length; d++) {
        this.moveEntity(obj.pins[d], this.entities[obj.pins[d]].x + dx, this.entities[obj.pins[d]].y + dy);
    }
}
moveBy(duid,dx,dy){
    let obj=this.entities[duid]
       if (!obj || !obj.alive) return false
    this.moveEntity(duid,obj.x+dx,obj.y+dy)
    for(let d=0;d<obj.pins.length;d++){
    let obj=this.entities[obj.pins[d]]
       if (!obj || !obj.alive)continue
        this.moveBy(obj.pins[d],dx,dy)
    }
}
drawFromArray(arr,x,y,anchorX,anchorY,layer=0){//x,y - это левый верхний край//-1 - воздух!
    let startX=x
    let startY=y
    let endY=startY+arr.length
    let endX=x
    for(y;y<endY;y++){
        for(x=startX;x<startX+arr[y-startY].length;x++){
            this.addTile(arr[y-startY][x-startX],x,y,layer)
        }
    }
    return true
}
rebuildSpatialHash(){
    this.spatialHash.clear()
    for(let d=0;d<this.elements.length;d++){
        let lells=this.elements[d];
        for(let e=0;e<lells.length;e++){
            this.#addToSpatHash(lells[e].duid)
        }   
    }
}
}
let engine=new tilemap('game')

class Robot{
    constructor(tilemap=engine,seed,duid=0,width=200,height=64){
        this.brain=new RazNetwork(2,9*9+2+2+2+2+1+1+1,seed)
         this.x=0
        this.y=0
    this.bestSteps=0
    this.lastView=new Float64Array(81)
        this.mem=[0,0]
this.effictiveSteps=0
        this.longMem=[0,0]
        this.longestMem=[0,0]
        this.randState=seed
        this.totalReward=0
        this.duid=duid
        this.engine=tilemap
        this.oldX=0
          this.lastDistReward=0
        this.oldY=0
        this.obj=this.engine.entities[duid]
        this.userReward=0
        this.userBonus=0
        this.tileId=0
        this.epochs=0
        this.steps=0
        this.totallyReward=0
        this.currentPath=[]
        this.allAchiv=[]
        if(this.obj){
        this.obj.robot=this

        }
    this.dirs = [
    [0, -1],
    [0, 1],  
    [-1, 0], 
    [1, 0],   
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [0,0]
    ]
    this.rewards={
        move:[-1.2],
    }
    }
    getDir(index) {
    return this.dirs[index % 9];
    }
    syncObj(){
        this.engine.moveEntity(this.duid,this.x,this.y)
    }
move(dir,writeCurPath=true) {
    let [dx, dy] = this.getDir(dir)
    this.obj.tileId = Math.max(dx+3,4)
    let tile = this.engine.getTileByXY(this.x + dx, this.y + dy, true)
 //   let tiled=engine.entities[tile]
  // // let belowTile = this.engine.getTileByXY(this.x, this.y + 1, true) // ← земля под ногами
//console.log("я иду!",dir,this.x,this.y,tile)
    let reward = this.rewards.move[0]
    this.oldX = this.x
    this.oldY = this.y
tile=this.engine.entities[tile]
if (tile !== undefined) {
    this.tileId = tile.id;
    
    // --- НОВОЕ: ЗАЖИГАНИЕ ФАКЕЛА ---
    if (tile.id === torch && !tile.isLighten) {
        tile.isLighten = true;
        tile.color="#eeff00"
        tile.tileId = tile.naprav?6:7; // спрайт горящего
     //   let tiled=this.engine.addTile(cvet,-tile.x,-tile.y,1)
     //   tiled.w=3
     //   tiled.h=3
    //    tile.pins[0]=tiled.duid
    //    this.engine.moveEntity(tiled.duid,tile.x-2,tile.y-2)
engine.playAnim(tile.duid, tile.naprav, 0, 5,5,
x=>engine.playAnim(tile.duid,tile.naprav+2,0,5,Infinity)); // анимация
    torchesLeft--;
        this.userReward += tile.reward; // награда
        console.log("Факел зажжен! Осталось:", torchesLeft);
    }
    if(tile.id!==torch){
    let tmp = 0;
    if (tile.id == out && torchesLeft === 0) { // Выход работает только если все факелы горят
        tmp = (robot.bestSteps / robot.steps) * 3;
        return tile.reward + tmp;
    } else if (tile.id == out && torchesLeft > 0) {
        return -10; // Выход закрыт, штраф
    }
    if(tile.id==out){
    this.currentPath[this.currentPath.length]=[this.x+dx,this.y+dy,tile.id]
    }
    return tile.reward + tmp;
    }


}
this.effictiveSteps++
   this.tileId=-1
        if (dy != 0) {
            // Двигаемся по диагонали только если есть земля под ногами
           
                this.x += dx
                this.y += dy
          
        } else {
            // Горизонтальное движение
            this.x += dx
        }
    

    if (this.x === this.oldX && this.y === this.oldY) {
        return -2
    }
if (this.x < 0 || this.x >= this.width || this.y < 0 || this.y >= this.height) {
    return -10 // штраф за выход за границы
}
//console.log(this.oldX,this.oldY,this.x,this.y)
let id = tile?tile.id:-1;
if(this.oldX!=this.x&&this.oldY!=this.x){
    this.currentPath[this.currentPath.length]=[this.x,this.y,id]
}
    this.syncObj()
   // console.log("получил ",reward,"награды")
    return reward
}
    forward(lr=0.01,dopamine=0,forget=0.8,rewardWeight=1,t=0.7){
        let view=this.getView()
        let rand=this.randState/2**32
        this.randState=rdg(this.randState)
       let mem=this.mem
      let result=this.brain.forward([...view,...mem,this.totalReward/2000,rand,1,...this.longMem,...this.longestMem,this.bestSteps/this.steps,(torchesLeft/totalTorches)||0],t)
      let res=result.totals
        for(let d=0;d<res.length;d++){
            res[d]=res[d]||0
        }
//console.log(res)

      let dir=Math.floor((res[0]*20||0)+(res[1]*4)||0)

  //    console.log(res[3],res);
//console.log("Выбранное действие:", act);

        let reward=this.move(dir%9)
 //   console.log(reward)
let distance = this.getDistReward()||0
//console.log(this.currentPath)


reward += distance
   //console.log(reward,distance,this.x,this.oldX)
reward+=this.userBonus+this.userReward
this.userReward=0
    //    console.log(reward)
//console.log(result,reward,view)
 //if (this.lastAction === act && this.lastDir === dir) {
  //      reward += 1.5
  //  }
   //   if (this.x === oldX && this.y === oldY) {
   //     reward += 1
  //  }
            this.brain.backwardRL(reward,lr,res,-10,10)
        for(let d=0;d<this.mem.length;d++){
            this.mem[d]=this.mem[d]*forget+(res[d]*(1-forget))
            this.longMem[d]=this.longMem[d]*0.9995+(res[d]*(1-0.9995))
            this.longestMem[d]=this.longestMem[d]*0.99995+(res[d]*(1-0.99995))

        }
this.totallyReward+=reward

        this.totalReward+=reward
        return reward
    }
   /* getDistReward(){
        if(this.oldX==this.x&&this.oldY==this.y){//||(this.y-this.oldY==1&&this.x==this.oldX)||(this.x-this.oldX==1&&this.y==this.oldY)){
            this.lastDistReward-=2
            this.lastDistReward*=0.9999
            return this.lastDistReward
        }
     
    let bonus=((this.oldX-this.x) + (this.oldY-this.y))
       let maxDist = Math.abs((startRe.x - outRe.x) + (startRe.y - outRe.y))  // максимум
let curDist= Math.abs((this.x - outRe.x) + (this.y - outRe.y))+bonus
let distance=curDist
console.log(distance)
this.oldX=this.x
this.oldY=this.y
this.lastDistReward=(maxDist-distance)/maxDist
        return(distance)
    }*/
   //временно заменю на //я заменил навсегда????
   getDistReward(mul=3){
    return Math.abs((35-Math.abs(Math.abs(outRe.x-this.x) + Math.abs(outRe.y-this.y)))/35)*mul//*0.1//Math.abs((startRe.x - outRe.x) + (startRe.y - outRe.y))/2-Math.abs((this.x - outRe.x) + (this.y - outRe.y))
   }
    getView(){
        this.lastView.fill(0)
        let view=this.lastView
        let half=Math.floor(9/2)
        for(let y=this.y-half;y<this.y+half+1;y++){
            for(let x=this.x-half;x<this.x+half+1;x++){
                let tile=this.engine.entities[this.engine.getTileByXY(x,y,true,false)]
                let id
                if(tile){
                    id=tile.id+1
                    if(tile.id==torch&&tile.isLighten){
                        id+=0.5
                    }
                }else{
                    id=-1
                }
                
            //    console.log(tile)
            let ny = (y - this.y) + half  // y - this.y даёт -2..2, +2 даёт 0..4
let nx = (x - this.x) + half  // x - this.x даёт -2..2, +2 даёт 0..4
             
view[ny*9+nx]=(id/4)||0
            }
        }
         return this.lastView
    }
   
}
function compactEmbedding(emb){
    let tot=[]
    for(let d=0;d<emb.length;d+=2){
        tot[d/2]=emb[d]*0.6+emb[d+1]*0.4
    }
    return tot
}
//getSq(2,1,1,0.5,0.01,0.5,1e-16,20)
function fastWAct(k){
    let m=k*(3-k)
    let d=m*m
    return d/(d+1)
}
//[4,2,1,0,3]
/*идея сети сердца:
оно принимает выходы ее сети,
обновляет свое состояние на основе молученного и оно учавствует в обработке,
возвращает новые ответы сети для которой работает
и сеть с которой оно работает использует его ответы..
тем самым оно влияет на состоьяние сети
,и работать может подобно реальной сети сердца...
 */
class Heart{
    constructor(neus,outsOfNetCount,seed,act=fastWAct,network,perParam=1,forget=0.8){
        this.neus=neus
        this.act=act
        this.states=new Float64Array(neus).fill(1)
        this.outsCount=outsOfNetCount+this.states.length+1
        this.weightsPerParam=perParam
        this.randState=seed
        this.seed=seed
        this.weights=new Float64Array((this.neus*this.outsCount)*this.weightsPerParam)
        for(let d=0;d<this.weights.length;d++){
            this.weights[d]=this.randState/2**32
            this.randState=rdg(this.randState)
        }
        this.network=network
        this.forget=forget
        this.emotionalState=1
        this.beatRate=1
        this.lastResult=[]
    }
    tick(reward=1){
        if(this.network&&this.network.lastResult){ 
    let totals=[]
    let rw=this.weights
    let inp=[...this.network.lastResult,...this.states,1]
    for(let d=0;d<this.neus;d++){
        let shift=this.outsCount*d*this.weightsPerParam
            let w=rw[shift]||1
        let total=inp[0]/w
           for(let e=1;e<this.weightsPerParam;e++){
            total+=inp[0]/rw[shift+e]
           }
//tupos[tupos.length]=-inp[0] * (w*this.yMul + 2*this.eps) / ((w+this.eps)*(w - w*this.yMul - this.eps))
        for(let e=1;e<inp.length;e++){
            let param=inp[e]
            let sum=0
        for(let f=0;f<this.weightsPerParam;f++){
                 let w=rw[shift+2*e+f]
            sum-=param/w
        }
        total-=sum
   //     console.log(total,w,inp[e]/w)
//tupos[tupos.length]=0//-inp[e] * (w*this.yMul + 2*this.eps) / ((w+this.eps)*(w - w*this.yMul - this.eps))
     //   if(d==3){
     //       console.log(total,w,inp[e]/w)
    //    }
}
      
        total=this.act(total*0.02*this.beatRate)
        totals[totals.length]=total
    }
            
        for(let d=0;d<this.states.length;d++){
            this.states[d]=this.states[d]*this.forget * this.beatRate+totals[d]*(1-this.forget * this.beatRate)
        }
        let emotionalSignal = reward || 0

// Сглаживание эмоций
this.emotionalState = this.emotionalState * 0.9 + emotionalSignal * 0.1

// Пульс
this.beatRate = 0.02 + this.emotionalState * 0.5
this.lastResult=totals
    return totals
}
return null
        }
    adapt(reward,lr,outs=this.lastResult){
    let curNeu=0
  // console.log(reward,outs)
    for(let d=0;d<this.weights.length;d++){
        if(d%(this.inpsCount*this.weightsPerParam)==0&&d!=0){
            curNeu=(curNeu+1)%outs.length
        }
        let delta=(this.randState/2**32)*2-1
        this.randState=rdg(this.randState)
   //    console.log(lr*(reward||1)*(outs[curNeu]||1)*delta,d,reward,outs)
        this.weights[d]+=lr*reward*(outs[curNeu]||1)*delta*this.emotionalState
        this.weights[d]%=5
    //    console.log(lr,reward,outs[curNeu])
 //   this.weights[d]=Math.tanh(this.weights[d]*5)
       // this.weights[d] = (this.weights[d] / (Math.abs(this.weights[d]) + 1)) * max + min;
    }
    }
}
class RazNetwork{
constructor(count,inps,seed,act=fastWAct){
    this.stateRng=seed
    this.weights=new Float64Array(count*inps)
    this.attentionToWeights=new Float64Array(count*inps)
    for(let d=0;d<this.weights.length;d++){
        this.weights[d]=this.stateRng/2**32
        this.stateRng=rdg(this.stateRng)
        this.attentionToWeights[d]=this.stateRng/2**32
        this.stateRng=rdg(this.stateRng)
    }

    this.neus=count
    this.inpsCount=inps
    this.yMul=0.2
    this.eps=1e-6
    this.lastResult=null
    this.act=act
    this.stateRng2=seed+1
}
 forward(inp,t=0.7){//считаем результаты,тупорадиенты и возвращаем как результаты так и тупорадиенты
    let totals=[]
    let tupos=[]
    let rw=this.weights
    for(let d=0;d<this.neus;d++){
        let shift=this.inpsCount*d
            let w=rw[shift]||1
        let total=(inp[0]*this.attentionToWeights[shift])/w
//tupos[tupos.length]=-inp[0] * (w*this.yMul + 2*this.eps) / ((w+this.eps)*(w - w*this.yMul - this.eps))
        for(let e=1;e<inp.length;e++){
            let w=rw[shift+e]
        total-=(inp[e]*this.attentionToWeights[shift+e])/w
   //     console.log(total,w,inp[e]/w)
//tupos[tupos.length]=0//-inp[e] * (w*this.yMul + 2*this.eps) / ((w+this.eps)*(w - w*this.yMul - this.eps))
     //   if(d==3){
     //       console.log(total,w,inp[e]/w)
    //    }
}
      
        total=this.act(total*0.02)*t+(1-t)*(this.stateRng2/2**32)
        this.stateRng2=rdg(this.stateRng2)
        totals[totals.length]=total
    }
    this.lastResult=totals
return {tupos,totals} 
}
backward(reward,lr,tupos){
    for(let d=0;d<tupos.length;d++){
        let delta=this.stateRng/2**32
        this.stateRng=rdg(this.stateRng)
     //   console.log()
        this.weights[d]+=lr*reward*tupos[d]*delta
    }
}
backwardRL(reward,lr,outs,min,max){
    let curNeu=0
  // console.log(reward,outs)
    for(let d=0;d<this.weights.length;d++){
        if(d%this.inpsCount==0&&d!=0){
            curNeu=(curNeu+1)%outs.length
        }
        let delta=this.stateRng/2**32
        this.stateRng=rdg(this.stateRng)*2-1
   //    console.log(lr*(reward||1)*(outs[curNeu]||1)*delta,d,reward,outs)
        this.weights[d]=(this.weights[d]+lr*reward*(outs[curNeu]||1)*delta)%5
        this.attentionToWeights[d]=(this.attentionToWeights[d]+lr*reward*(outs[curNeu]||1)*delta*this.weights[d])%3
    //    console.log(lr,reward,outs[curNeu])
 //   this.weights[d]=Math.tanh(this.weights[d]*5)
       // this.weights[d] = (this.weights[d] / (Math.abs(this.weights[d]) + 1)) * max + min;
    }
}
}
let torchesLeft = 0;
let totalTorches = 0;

let brick=engine.createTile("#813a07","brick",{reward:-0.1,tileId:0})
let out=engine.createTile("#fcb900","out",{reward:100,tileId:1})
let start=engine.createTile("#228B22","in",{reward:0,tileId:2})
let robotId=engine.createTile("#e72042","robot",{reward:0,robot:null,tileId:3})
let torch=engine.createTile("#e2ff3d","torch",{reward:10,
    tileId:8,
    isLighten:false,
    w:1,
    h:1,
    anim:[[13,14,15,16,17,7],[8,9,10,11,12,6],[17,7],[12,6]],
    spr:[6,7],
    onCreate:function(){this.x+=0.2}
})
let tma=engine.createTile("#000000","tma",{reward:0,
tileId:20,w:20,h:15
})
let cvet=engine.createTile("#fffb00","cvet",{reward:0,
tileId:19,w:20,h:15
})
let torches=[]
function updateTorches() {
    torchesLeft = 0;
    totalTorches = 0;
    for (let d = 0; d <torches.length; d++) {
        let el = torches[d]
        if (el.alive) {
            clearTimeout(el.timerId)
            if(el.pins[0]){
                engine.remEntity(el.pins[0])
            }
            el.color="#e2ff3d"
            el.tileId=el.naprav?8:13
            el.isLighten = false; // Сбрасываем
            torchesLeft++;
            totalTorches++
        }
    }
    // Обновляем интерфейс сразу
    if (picol) picol.innerHTML += `<br>Факелов: ${totalTorches - torchesLeft} / ${totalTorches}`;
}
let robot=new Robot(engine,0,0),dtMax,robotBody={}
robot=undefined
let lastStart=Date.now()
function startGame(fps,seed=2,lr,hardReset){
   if(hardReset&&robot!=undefined){
    let ans=confirm("Вы точно хотите стереть робота и начать с нуля для робота???")
    if(!ans){
        return;
    }
   }
    if(robot==undefined||hardReset){
robotBody=engine.addTile(robotId,0,0)
     robot=new Robot(engine,seed,robotBody.duid)
    robot.x=startRe.x
    robot.y=startRe.y
    robot.syncObj()
    dtMax=1000/fps
    lastStart=Date.now()
   }
    loop(dtMax,lr)
}
let forget=0.8,rewardWeight=0.2
let picol=document.getElementById("data")
let times=[]
function pushTimes(){
times[times.length]=Date.now()    
}
let modes={0:"🧱 стены",1:"🚪👑 выход",2:"🚪🔓 вход",4:"🔦факел","delete":"delete","":"ничего"}
let stableTime=0,end1=0,workingTime=0
function loop(dt=dtMax,lr=0.01,hardReset=true){
    if(dtMax==null){
        dtMax=1000/settings.fps
    }
    loop.running=true
let start=end1
let start2=performance.now()
    robot.forward(lr,false,forget,rewardWeight,settings.t)
  //  engine.cameraX=robot.x*32
  //  engine.cameraY=robot.y*32
    robot.syncObj()
   // console.log(robot.x,robot.y)
   robot.epochs++
//seed 1000000000000000000000000000000
    engine.draw()
    if(Math.abs(robot.totalReward)>=100_000){
        robot.totalReward/=2000
    }
     robot.steps++
 // Проверка через движок:
let tile = engine.getTileByXY(robot.x, robot.y, true)
let won=false
if (robot.tileId==out&&torchesLeft==0) {
    if(robot.steps>1){
    robot.allAchiv[robot.allAchiv.length]=[lastStart,Date.now(),robot.steps,workingTime,[...robot.currentPath]]
won=true
}
robot.currentPath=[]
    console.log('Решил задачу за',robot.steps,("~="),robot.steps/settings.fps,"сек","точно:",(robot.allAchiv[robot.allAchiv.length-1][1]-robot.allAchiv[robot.allAchiv.length-1][0])/1000)

    if(robot.bestSteps>robot.steps||robot.bestSteps==0){
    console.log("новый рекорд "+robot.steps+" шагов!Быстрее старого в "+robot.bestSteps/robot.steps+" раз!")
    robot.bestSteps=robot.steps
    }else{
    console.log("медленнее старого в "+robot.steps/robot.bestSteps+" раз!")
    }

    robot.steps=0
    lastStart=Date.now()
    if (robot.allAchiv.length >= 2) {
    let prev = robot.allAchiv[robot.allAchiv.length - 2]; // Предыдущий
    let curr = robot.allAchiv[robot.allAchiv.length - 1]; // Текущий
    if (curr[1] - prev[1] <= 5 * 1000 / settings.fps) {
        console.log("возможно накручивает!")
        robot.userReward -= 2
    }
}
updateTorches()
  robot.x = startRe.x;
robot.y = startRe.y;
robot.syncObj(); 
robot.tileId = start; 
    console.log("для честности сброс коордлиант на старт")
}
picol.innerHTML=`Данные: Выборов сделано:${robot.epochs}<br>
Шагов сделано пытаясь найти путь:${robot.steps}<br>.
Память:Средневременная:${robot.mem.map(x=>Math.round(x*10000)/10000)}
<br>Долговременная:${robot.longMem.map(x=>Math.round(x*10000)/10000)}.
<br>Длиннейшая:${robot.longestMem.map(x=>Math.round(x*10000)/10000)}.
<br>Накопленная награда:${robot.totalReward}
<br>Рекорд прохождения:${robot.bestSteps}
<br>Для строительства выбрано:${modes[build]}
<br>Факелы:${torchesLeft}/${totalTorches} факелов`
let end=performance.now()
let dtW=Math.max(0,(dtMax-(end-start2)))
//console.log(dtW)
stableTime=stableTime*0.8+(dtMax-dtW)*0.2
picol.innerHTML+=`
<br>Стабильное время шага с оверхедами и т.д:${Math.round(stableTime*1000)/1000} мс
<br>Работа цикла:${(Math.round((end-start2))*1000)/1000} мс`
loop.last=setTimeout(loop,dtW,dtMax,lr,false)
end1=performance.now()
if(workingTime<1000){
workingTime+=end1-start
}else{
    workingTime+=dtMax
}
if(won){
    robot.allAchiv[robot.allAchiv.length-1][3]=workingTime
    workingTime=0
}
}


/*
еще 
еще вариант
color.r = mix(180, 231, t);
color.g = mix(16, 32, t);
color.b = mix(30, 66, t);
*/



function downloadData(data, filename = 'save.json',type) {
    let blob=new Blob([data],{type:type})
    let url=URL.createObjectURL(blob)
    let a=document.createElement("a")
    a.href=url
    console.log(a)
    a.download=filename
    a.click()
}
let onBuild=false
let build=""
let inCount=0
let startRe={}
let outsCount=0
let outRe={}
   engine.canvas.addEventListener("mousedown", (e) => {
    onBuild=true
   })
   engine.canvas.addEventListener("mouseup", (e) => {
    onBuild=false
   })
   engine.canvas.addEventListener("mousemove", (e) => {
    if(onBuild){
    let rect = engine.canvas.getBoundingClientRect()
       let [x,y]=normOffXY(e.offsetX,e.offsetY)
 x = Math.floor((x) / engine.tileWidth)
 y = Math.floor((y) / engine.tileHeight)
        buildF(x,y)
}
})
function normOffXY(x,y){
return [x/(engine.canvas.clientWidth/engine.canvas.width),y/(engine.canvas.clientHeight/engine.canvas.height)]
}
   engine.canvas.addEventListener("click", (e) => {
    let rect = engine.canvas.getBoundingClientRect()
    let [x,y]=normOffXY(e.offsetX,e.offsetY)
 x = Math.floor((x) / engine.tileWidth)
 y = Math.floor((y) / engine.tileHeight)
   console.log('Клик:', x, y,e.clientX,e.clientY,rect)

        buildF(x,y)
})
function buildF(x,y){
        x += Math.floor(engine.cameraX / engine.tileWidth)
    y += Math.floor(engine.cameraY / engine.tileHeight)
  //  console.log('Клик:', x, y,e.clientX,e.clientY)
    if(build=="delete"){
            let id=engine.getTileByXY(x,y,true)
       //     console.log(id)
        if(id!==undefined){
        let tileId=engine.entities[id].id
        if(tileId==start){
            inCount=0
            startRe={}
        }
        if(tileId==out){
            console.log("yee")
            outsCount=0
            outRe={}
        }
        if(tileId!=robotId){
            if(tileId==torch){
                totalTorches--
            }
    engine.remEntity(id)
        }
    }
    }else if(!engine.getTileByXY(x,y,true)){
        if(build==start&&inCount!=0){
            console.log("максимум один вход")
        }else if(build==out&&outsCount!=0){
        
        }else{
let naprav=0
let tileN=0
            if(build==torch){
naprav=engine.getTileByXY(x-1,y,true)?1:engine.getTileByXY(x+1,y,true)?0:3
console.log(engine.getTileByXY(x-1,y,true),engine.getTileByXY(x+1,y,true))
console.log(naprav)
tileN=naprav?8:13
if(naprav==3){
    return
}
    }
let tile=engine.addTile(build, x, y)
    if(build==start){
        inCount=1
        startRe=tile
    }
    if(build==out){
           outsCount=1
        outRe=tile
    }
            if(build==torch){
            torchesLeft++
            totalTorches++
            torches[torches.length]=tile
            tile.naprav=naprav
            tile.tileId=tileN
            }
        }
    }
    engine.draw()
}
let settings={
    lr:0.5,
    bonus:0,
    seed:100,
    fps:20,//choices per second
    t:0.7,
    hardReset:false,
    tma:true
}
let balance={
    torch:10,
    potential:3,
    fine:-1.2,
    walls:-2,
}
function startGameFull(){
 startGame(settings.fps,settings.seed,settings.lr,settings.hardReset,settings.t)
 console.log("игра началась...")
}
function stop(){
    clearTimeout(loop.last)
    loop.running=false;
    return true
}
function coolSettings(){//охладим и применим настройки
 settings.lr=parseFloat(document.getElementById("lr").value)||0
 settings.bonus=parseFloat(document.getElementById("bonus").value)||0
    if(robot){
        robot.bonus=settings.bonus
    }
 settings.fps=parseFloat(document.getElementById("cps").value)||20
 settings.seed=parseFloat(document.getElementById("seed").value)||100
settings.t=parseFloat(document.getElementById("temp").value)||0.7
 settings.hardReset=document.getElementById("hardreset").checked||false
settings.tma=document.getElementById("tma").checked||false
engine.elements[1][0].view=settings.tma;
engine.draw()
 if(loop.running){
    stop()
    dtMax=1000/settings.fps
    loop(1000/settings.fps,settings.lr)
 }
}
function refreshSettings(){
    document.getElementById("lr").value=settings.lr||0
    document.getElementById("bonus").value=settings.bonus||0
    document.getElementById("cps").value=settings.fps||20
    document.getElementById("seed").value=settings.seed||100
    document.getElementById("hardreset").checked=settings.hardReset||false
    document.getElementById("tma").checked=settings.tma||false
    document.getElementById("temp").value=settings.t||0
}
function saveRobotAndMaze(){
    let mazed=saveOnlyMaze()
let state={
    maze:mazed.maze,
    torches:mazed.torches,
    robot:saveOnlyRobot().robot,
    settings: settings,
    timestamp: Date.now()  
}
return state
}
function saveOnlyRobot(){
    
    let obj={}
    for(let n in robot.obj){
        if(robot.obj.hasOwnProperty(n)){
            obj[n]=robot.obj[n]
        }
    }
    obj.robot=null
    let rob={
        brain:{
        weights:Array.from(robot.brain.weights),
        stateRng:robot.brain.stateRng,
        stateRng2:robot.brain.stateRng,
        attentionToWeights:Array.from(robot.brain.attentionToWeights)
        },
        bestSteps:robot.bestSteps,
        mem:robot.mem,
        longMem:robot.longMem,
        longestMem:robot.longMem,
        duid:robot.duid,
        obj:obj,
        x:robot.x,
        y:robot.y,
        userBonus:robot.userBonus,
        userReward:robot.userReward,
        totalReward:robot.totalReward,
        randState:robot.randState,
        epochs:robot.epochs,
        steps:robot.steps,
        steps:robot.effictiveSteps,
        allAchiv:robot.allAchiv,
        totallyReward:robot.totallyReward
    }
    return {robot:rob}
}
function saveOnlyMaze(){
const ROWS = 480 / 32; // 15
const COLS = 640 / 32; // 20

let data = new Array(ROWS);
for (let r = 0; r < ROWS; r++) {
    data[r] = new Array(COLS).fill(-1);
}
for(let d=0;d<engine.elements[0].length;d++){
    let el=engine.elements[0][d]
    if(el.alive&&el.id!=robotId&&el.y>=0&&el.x>=0){
        data[el.y][el.x]=el.id
    }
}
console.log(data);
let copyTorches=[...torches]
let compactTorches=[]
for(let d=0;d<copyTorches.length;d++){
    let out={x:copyTorches[d].x,
        y:copyTorches[d].y,
        isLighten:copyTorches[d].isLighten?1:0,
        naprav:copyTorches[d].naprav,
        tileId:copyTorches[d].tileId
    }
    compactTorches.push(out)
}
return {maze:data,torches:compactTorches}
}

function dobNoiseSt(x,y,state,width,height,seed){
    let fx=Math.floor(x),fy=Math.floor(y)
    let mx=x-fx,my=y-fy
    fx/=width
    fy/=height
    let rand=rdg(rdg(seed))/2**32
    let rand2=rdg(rdg(seed+fx))/2**32
    let rand3=rdg(rdg(seed+fy))/2**32
    mx+=rand
    my+=rand
   // let val2=((mx*state-fy*mx+fx*my+rand*state+my*state)*(fx-fy))/state
    let val=((mx*state+fy*mx+rand+fx*my+rand3*state+my*state-rand2)/(fx+rand+rand2+rand3+fy))/state
  //  console.log(val)//,rand==rdg(seed)/2**32,rand,rdg(seed),seed)
    return val
}
function createMaze(width,height,seed,forget=0.8,mul=3.2,balance=[0.5,0.9,0.94]){
    let max=dobNoiseSt((width-1)*mul,(height-1)*mul,1,width,height,seed)
    let state=1
    let res=[]
    for(let y=0;y<height;y++){
        res[y]=[]
        for(let x=0;x<width;x++){
        let id=dobNoiseSt(x*mul,y*mul,state,width,height,seed)/max
        state=state*forget+id*(1-forget)
        let tot=0
        if(id<balance[0]){
            tot=brick
        }else if(id<balance[1]){
            tot=-1
        }else if(id<balance[2]){
            tot=brick
        }else{
            tot=-1
        }
        res[y][x]=tot
        }    
    }
    return res
}
function loadFromFile(){
    let y=confirm("ВЫ ТОЧНО ХОТИТЕ ЗАГРУЗИТЬ ЧТО ХОТИТЕ?")
    if(y){
    let z=confirm("СДЕЛАТЬ ПОЛНЫЙ БЕКАП???")
        if(z){
            downloadData(JSON.stringify(saveRobotAndMaze()),`backup_${Date.now()}_robot_dob.json`,"application/json")
        }
        let hren=document.createElement("input")
    hren.type="file"
    hren.onchange=e=>{
        try{
        let file=hren.files[0]
        let reader=new FileReader()
        reader.readAsText(file)
        reader.onload=e=>{
            let res=e.target.result
            let parsed=JSON.parse(res)
            console.log(parsed)
            if(parsed){
                if(parsed.maze){
                    console.log("будет больно!")
                    engine.removeAllEls([robotId,tma])
                    engine.collectGarbage()
                    torches=parsed.torches
                    console.log(torches)
                    engine.drawFromArray(parsed.maze,0,0,0,0)
                    engine.collectGarbage()
                    torchesLeft=0
                                totalTorches=0
                    for(let x=0;x<engine.elements[0].length;x++){
                        if(engine.elements[0][x].alive){
                            if(engine.elements[0][x].id==start){
                                startRe=engine.elements[0][x]
                            }else if(engine.elements[0][x].id==out){
                                outRe=engine.elements[0][x]
                            }else if(engine.elements[0][x].id==torch){
                                console.log("tiorch")
                                let el=engine.elements[0][x]
                                let id=engine.getTileByXY(el.x,el.y,true,1)
                                let el2=engine.entities[id]

                                for(let y=0;y<torches.length;y++){
                                    if(el2.x==torches[y].x&&el2.y==torches[y].y){
                                        for(let n in torches[y]){
                                            if(torches[y].hasOwnProperty(n)){
                                                el2[n]=torches[y][n]
                                           //     console.log(el2)
                                            }
                                        }
                                        torches[y]=el2
                                    }
                                }
                                if(el2.isLighten){
                                engine.playAnim(el2.duid,el2.naprav+2,0,5,Infinity)
                                }else{
                                    torchesLeft++
                                }
                                totalTorches++
                            }
                        }
                    }
                }
                if(parsed.robot){
                    if(robot==undefined){
                        robotBody.alive=false
                        robotBody={...(robotBody||{}),...parsed.robot.obj}
                        //engine.nextDuid=robotBody.duid
                        let got=engine.addTile(robotId,robotBody.x,robotBody.y)
                        delete engine.entities[got.duid]
                        engine.entities[robotBody.duid]=robotBody
                        engine.elements[0][got.arrayIndex]=robotBody
                        engine.spatialHash.delete(got.x+","+got.y)
                        robotBody.alive=true
                        robot=new Robot(engine,100,parsed.robot.obj.duid)
                    }
                      for(let n in parsed.robot){
                            if(parsed.robot.hasOwnProperty(n)){
                                let name=n
                                let val=parsed.robot[n]
                                console.log(val)
                                if(typeof val == "object"&&!Array.isArray(val)){
                                    console.log("obj")
                                    for(let n2 in parsed.robot[val]){
                                        if(val.hasOwnProperty(n2)){ 
                                            let val2=val[n2]
                                            if(n2=="weights"||n2=="attentionToWeights"){
                                                val[n2]=new Float64Array(val2)
                                            }else{
                                                val[n2]=val2
                                            }
                                        }   
                                    }
                                }else{
                                    robot[name]=val
                                }
                            }
                        }
                        robot.allAchiv=parsed.robot.allAchiv||[]
                    engine.nextDuid=robotBody.duid+1
                   if(parsed.heart){

                    }
                }
                if(parsed.settings){
                    settings={...settings,...parsed.settings}
                }
                if(parsed.robot&&parsed.settings&&loop.running){
                    stop()
                    loop(1000/settings.fps,settings.lr)
                }
                alert("готово!")
            }
        }
    }catch(err){
        alert("are u trying to break this site???there's some errors in file! go to console if you want to see")
        console.log("are u trying to break this site???there's some errors in file!Errors:",err)
    }
    }
    hren.click()
    }
}
function createHardMaze(width,height,epochs=100,seed=100,density=0.4){
    let map=new Array(height)
    for(let d=0;d<map.length;d++){
    map[d]=new Array(width).fill(1)
    }
    let state=seed
  let mem=0
    let normDensity=2**32*density
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
          let val=rdg(state+mem)
          let id=-1
          if(val<normDensity){
          id=0
          }
      map[y][x]=id
          mem=mem*0.9+rdg(state+mem)*0.1
          state=rdg(state+mem)
      }
  }
    for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
            if(x==0||y==0||x==width-1||y==height-1){
            map[y][x]=0
            }
        }
    }
//    console.log(mem,state)
    return map
}
function compressByDelta(arr){
let out=[arr[0]]
for(let d=1;d<arr.length;d++){
let d2=[arr[d][0]-arr[d-1][0],arr[d][1]-arr[d-1][1],arr[d][2]-arr[d-1][2],arr[d][3]-arr[d-1][3]]
    out[out.length]=d2
}
    return out
}
let phi=1.618
for(let d=0;d<46;d++){
phi=1/phi+1
}
function calcPhibN(count){
let arr=[1,1]
    for(let d=2;d<count;d++){
    arr[arr.length]=Math.round(phi*arr[d-1])
    }
    return arr
}
engine.loadSpriteSheet("tileset.png",true,0).then(x=>engine.draw())
engine.loadSpriteSheet("tilesetAI.png",true,1)

engine.drawFromArray(createMaze(640/32,480/32,101,0.9996,60.4,[0.43,0.57,0.81]),0,0,0,0)
for(let y=0;y<15;y++){
 for(let x=0;x<20;x++){
if(y==0||x==0||x==19||y==14){
    if(engine.getTileByXY(x,y,true)==undefined){
        engine.addTile(brick,x,y)
    }
}
}   
}
function changeTheme(id){
    if(id==-1){
        id=0
    }
    let themes=["classic","handmade","ai"]
    let nThemes=[-1,0,1]
    console.log("selected theme:",themes[id])
    id=nThemes[id]
    for(let d=0;d<engine.elements[0].length;d++){
        if(engine.elements[0][d].id==torch){
            if(id==-1){
               engine.elements[0][d].w=0.5
            }else{
                engine.elements[0][d].w=1
            }
        }
        engine.elements[0][d].sprN=id
    }
    for(let d=0;d<engine.tileTypes.length;d++){
        engine.tileTypes[d].sprN=id
    }
    engine.draw()
}
/*engine.elements[163]={
    "color": "#813a07",
    "name": "brick",
    "x": -9,
    "y": -7,
    "offsetX": 0,
    "offsetY": 0,
    "alive": true,
    "pins": [],
    "w": 20,
    "h": 15,
    "tileId": 5,
    "sprN": 0,
    "reward": -0.1,
    "duid": 163,
    "id": 0,
    "arrayIndex": 163
} */
function sumUPCompen(arr){
let sum=0
let compen=0
let oldSum=0
for(let d=0;d<arr.length;d++){
let val=arr[d]-compen
sum+=val
compen=sum-val-oldSum
oldSum=sum
}
    return {sum,compen,res:sum-compen}
}
let openers={}
function formatTime(data){
let shift=-new Date().getTimezoneOffset()/60
let hour=data/(60*60*1000)%24
let mins=(hour*60)%60
let secs=(mins*60)%60
let ms=(secs*1000)%1000
return `${Math.floor((hour+shift)%24).toString().padStart(2,0)}:${Math.floor(mins).toString().padStart(2,0)}:${Math.floor(secs).toString().padStart(2,0)}:${Math.floor(ms).toString().padStart(3,0)}`
}
class showerDialog{
    constructor(openerName,percentW,percentH,x,y){
    if(openers[openerName]){
        throw new Error("ошибка: попытка перезаписать уже существуюего открывателя")
    }
    this.w=percentW
    this.h=percentH
    this.x=x;
    this.y=y
    this.openerName=openerName
    this.openerNameObj="opener"+openerName
    openers[openerName]=this
    this.baseAppend=`<div id="${this.openerNameObj}" class='dcol-12 dbg-blue-blue' 
    style="position:fixed; display:none; height:30%;">
    <div id="${this.openerName}header" class="dcontainer"><div id="${this.openerName}windName" class="dcol-3">Заголовок вашего окна</div> 
 <button class='dbtn' onclick="openers['${openerName}'].close()">x</button>   
    </div>
    <div id="${this.openerName}dialog" style="height:90%">0</div>
   </div>

    </div>`
    document.body.insertAdjacentHTML("afterbegin",this.baseAppend)
    this.elem=document.getElementById(this.openerNameObj)
    this.dialog=document.getElementById(this.openerName+"dialog")
    this.registry={
        achivs:{
            html:`Внимание: коэф. 1 говорит насколько быстрее прошел лабиринт робот относительно прошлого рекорда, а коэф. 2 - относительно самого последнего рекорда.Еще: время которое тут указано - учитывает паузы от игрока, паузы от загрузки и т.д.Все достижения которые у робота есть:<br>`,
            render:function(){
                let out=`<div style="font-family: monospace, 'Courier New', Courier;
    line-height: 1.2; 
    font-size: 14px;white-space:pre;    overflow-y: scroll;
    height: 67%;">|Начало      |Конец       |Число шагов|Рекорд ли?|Коэф. 1    |Коэф. 2    |<br>`
                let bestSteps=Infinity
                for(let d=0;d<robot.allAchiv.length;d++){
                    let data=robot.allAchiv[d]
                    let steps=data[2]
                    out+="|"+formatTime(data[0])+"|"+formatTime(data[1])+"|"+data[2].toString().padStart(11," ")+"|"
                    if(d==0){
                        out+="        Да"+"|"+"Не применим|"+"Не применим<br>"
                    }else{
                        out+=(steps<=bestSteps?"        Да":"       Нет")+"|"+(Math.round((bestSteps*10000)/steps)/10000).toString().padStart(11," ")+"|"+(Math.round((robot.bestSteps*10000)/steps)/10000).toString().padStart(11," ")+"|<br>"
                    }
                    if(data[2]<bestSteps){
                        bestSteps=data[2]
                    }
                }
                return out+"</div>";
            },
        }
    }
    }
    add(name,data){
        if(!this.registry[name]){
            this.registry[name]=data
        }else{
            throw new Error("ОШИБКА: нельзя добавлять новое с тем же именем!")
        }
    }
    show(id="achivs"){
        this.elem.style.display="block"
        this.dialog.innerHTML=this.registry[id].html
        let html=this.registry[id].render()
        this.dialog.insertAdjacentHTML("beforeend",html)
        //this.elem.innerHTML+=` <button class='dbtn' onclick="openers['${this.openerName}'].close()">Закрыть</button>`
    }
    close(id){
        this.elem.style.display="none"
    }
    checkExcitment(){
        return !!openers[this.openerName]
    }
    correctNonExcitment(){
        if(openers==undefined){
            openers={}
            console.log("реестр почемуцто не существовал")
        }
        if(this.checkExcitment()&&!(openers[this.openerName]==this)){
            console.log("ошибка:конфликт имен и приколов")
        }
        if(!this.checkExcitment()){
            openers[openerName]=this
        console.log("восстановлен обратно")
        }
    }
}
let shw=new showerDialog("sad")
function getCoefForName(weights){
    let coef=1
    let anCoef=1
    for(let d=0;d<weights.length;d++){
    coef+=anCoef
    anCoef=robot.brain.weights[d]/anCoef
    }
    return coef
}
function getNameForRobot(time=Date.now(),weights,seed){
    let hrenCoef=getCoefForName(weights)
    let ost=hrenCoef%1
    hrenCoef-=ost
let alph = "BCDFGHJKLMNPQRSTVWXYZ";
let vovels="AEIOU"
 let name=""
    let state=seed+time
   let nextV=0
    while(hrenCoef>0){
        if(nextV>0){
   //     console.log(nextV,name)
name+=vovels[(hrenCoef%vovels.length+state)%vovels.length]
        nextV--
        }else{
    name+=alph[(hrenCoef%alph.length+state)%alph.length]
        nextV=state%3
        }
        state=rdg(state)
        hrenCoef=Math.floor(hrenCoef/alph.length)
    }
    return name+" "+Math.round(ost*1000)
}
/*let hrenCoef = 1
for (let d = 0; d < weights.length; d++) {
    hrenCoef = weights[d] / hrenCoef
} */
undefined
//getRandNameForRobot(Date.now(),robot.brain.weights,7)
//'ALEOE 960'
//getRandNameForRobot(Date.now(),robot.brain.weights,7)
//'OVEBL 960'
//getRandNameForRobot(Date.now(),robot.brain.weights,7)
//'EWIBC 960'
//getRandNameForRobot(1,robot.brain.weights,7)
//'ESZIO 960'/
//getRandNameForRobot(1,robot.brain.weights,7)
//'ESZIO 960'
//getRandNameForRobot(1,robot.brain.weights,9)//hrencoef of all = 285468.9602078836
//'OWAIN 960'
function createMazeForUser(seed){
let y=confirm("Вы уверены что хотите продолжить?Робот не будет сброшен,но вам заново придется ставить вход и выход")
    engine.collectGarbage()

if(y){
    engine.collectGarbage()
    inCount=0
    outsCount=0
    console.log(y)
let maze=createHardMaze(20,15,0,seed,0.5)
engine.removeAllEls([robotId,tma])
engine.drawFromArray(maze,0,0)
engine.draw()
}

}
function drawSetka(canvas,reset){
let drw=canvas.getContext("2d")
    if(reset){
    drw.clearRect(0,0,canvas.width,canvas.height)
    }
    for(let y=0;y<canvas.height;y+=35){
    for(let x=0;x<canvas.width;x+=35){
        drw.fillRect(x,y,3,canvas.height)
    }
    drw.fillRect(0,y,canvas.width,3)
}
}
function undist(a,b,c){
    let max=Math.abs(c.x-b.x)+Math.abs(c.y-b.y)
    return max-(Math.abs(a.x-b.x)+Math.abs(a.y-b.y))
}
class Vector{
    constructor(dim,vals){
        this.val=new Float64Array(dim).set(vals)
    }

}
function robotMazeCompleter(maze,outR,startR,rob,st={state:1},t=0.6){
    if(!robotMazeCompleter.data){
    robotMazeCompleter.data={30:[0,1,2,3,9,10,11,12,18,19,20,21,27,28,29,30],31:[2,3,4,5,11,12,13,14,20,21,22,23,29],32:[5,6,7,8,14,15,16,17,23,24,25,26,33,34,35],39:[18,19,20,27,28,29,36,37,38,45,46,47,54,55,56],48:[45,46,47,54,55,56,57,63,64,65,66,72,73,74,75],49:[56,57,58,59,60,65,66,67,68,74,75,76,77],50:[51,52,53,59,60,61,62,68,69,70,71,77,78,79,80],41:[24,25,26,33,32,35,42,43,44,51,52,53,60,61,62]}
    }
    let kletkas=[31, 49, 39, 41, 30, 32, 48, 50]
    let view=new Int8Array(81).fill(-1)
    let sh=0
    let maxY=Math.min(rob.y+5,15)
    let maxX=Math.min(rob.x+5,20)
    let minY=Math.max(rob.y-4,0)
    let minX=Math.max(rob.x-4,0)
    for(let y=minY;y<maxY;y++){
        for(let x=minX;x<maxX;x++){
            let ny = (y - rob.y) + 4  // y - this.y даёт -2..2, +2 даёт 0..4
            let nx = (x - rob.x) + 4
            view[ny*9+nx]=maze[y*20+x]
            sh++
        }
    }
    let weights=new Float32Array(8)
    let newXY={}
    for(let d=0;d<weights.length;d++){
        let data=robotMazeCompleter.data[kletkas[d]]
     //   console.log(data,d,kletkas[d])
        let i=kletkas[d]
    //    console.log(i)
        let freeKletkas=0,isOut=0,distPotential=0,hereOut=0
      //  console.log(view[i],kletkas[d])
        if(view[i]==out){
            isOut=100
        }
        if(view[i]!=0){
            for(let e=0;e<data.length;e++){
                if(view[data[e]]==-1||view[data[e]]==1){
                    freeKletkas++
                }
                if(view[data[e]]==out){
                    hereOut=20;
                }
            }
                  newXY.x=rob.x+robot.dirs[d][0]
        newXY.y=rob.y+robot.dirs[d][1]

        distPotential=undist(newXY,outR,startR)
        weights[d] = (freeKletkas*0.1 + isOut*0.8 + hereOut*0.5) + distPotential*0.7

// console.log("FREE",freeKletkas,weights[d],newXY)
        }
   }
    let decision=-1
    let total=0
    for(let d=0;d<weights.length;d++){
        total+=(weights[d]+1e-6)**t
    }
    for(let d=0;d<weights.length;d++){
        weights[d]=((weights[d]+1e-6)**t)/total
    }
    let r=rdg(st.state)
    let rand=r/(2**32)
    st.state=r
    for(let d=0;d<weights.length;d++){
      if (view[kletkas[d]] == 0) continue;
    //    console.log(view[kletkas[d]])
             rand-=weights[d]
            if(rand<0){
                decision=d
                break;
            }
    }
    return {weights,decision,view}
}
function findPath(maze,seed,outRe,startRe,temp=1,maxSteps=1000){
    let st={state:seed}
   let dirs = [
    [0, -1],
    [0, 1],  
    [-1, 0], 
    [1, 0],   
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [0,0]
    ]
    let rob={x:startRe.x,y:startRe.y}
    let path=[]
    for(let d=0;d<maxSteps;d++){
    let dec=robotMazeCompleter(maze,outRe,startRe,rob,st,temp)
if(dec.decision==-1){
    dec.decision=8
}
rob.x+=dirs[dec.decision][0]
rob.y+=dirs[dec.decision][1]
path[path.length]=[rob.x,rob.y]
if(rob.x==outRe.x&&rob.y==outRe.y){
break;
}

}
return path
}
function drawView(drw,view){
    for(let d=0;d<view.length;d++){
        let id=view[d]
        let x=d%9
        let y=d/9|0
        if(id!=-1){
        drw.fillStyle=engine.tileTypes[id].color
        }else{
        drw.fillStyle="#FFFFFF"
        }
        if(d==40){
        drw.fillStyle="#e72042"
        }
        drw.fillRect(x*16,y*16,16,16)
    }
}
let maze=saveOnlyMaze().maze.flat()
let st={state:1}
function loop2(dt=dtMax,lr=0.01,hardReset=true){
    loop.running=true
    
let start=end1
let start2=performance.now()
let dec=robotMazeCompleter(maze,outRe,startRe,robot,st,1)
if(dec.decision==-1){
    dec.decision=8
}
engine.draw()
robot.x+=robot.dirs[dec.decision][0]
robot.y+=robot.dirs[dec.decision][1]
drawView(engine.drw,dec.view)

robot.tileId=maze[robot.y*20+robot.x]
robot.syncObj()
    //console.log(robot.x,robot.y,dec,maze[(robot.y+robot.dirs[dec.decision][0])*20+(robot.x+robot.dirs[dec.decision][1])]!=0)
    robot.syncObj()
   // console.log(robot.x,robot.y)
     robot.steps++
 // Проверка через движок:
let tile = engine.getTileByXY(robot.x, robot.y, true)
let won=false
if (robot.tileId==out) {
    if(robot.steps>1){
    robot.allAchiv[robot.allAchiv.length]=[lastStart,Date.now(),robot.steps,workingTime]
won=true
}
    console.log('Нашёл за',robot.steps,("~="),robot.steps/settings.fps,"сек","точно:",(robot.allAchiv[robot.allAchiv.length-1][1]-robot.allAchiv[robot.allAchiv.length-1][0])/1000)

    if(robot.bestSteps>robot.steps||robot.bestSteps==0){
    console.log("новый рекорд "+robot.steps+" шагов!Быстрее старого в "+robot.bestSteps/robot.steps+" раз!")
    robot.bestSteps=robot.steps
    }else{
    console.log("медленнее старого в "+robot.steps/robot.bestSteps+" раз!")
    }

    robot.steps=0
    lastStart=Date.now()
    if (robot.allAchiv.length >= 2) {
    let prev = robot.allAchiv[robot.allAchiv.length - 2]; // Предыдущий
    let curr = robot.allAchiv[robot.allAchiv.length - 1]; // Текущий
    if (curr[1] - prev[1] <= 5 * 1000 / settings.fps) {
        console.log("возможно накручивает!")
        robot.userReward -= 2
    }
}
  robot.x = startRe.x;
  robot.epochs++
robot.y = startRe.y;
robot.syncObj(); 
robot.tileId = start; 
    console.log("для честности сброс коордлиант на старт")
}
picol.innerHTML=`Данные: Выборов сделано:${robot.epochs}<br>
Шагов сделано пытаясь найти путь:${robot.steps}<br>.
Память:Средневременная:${robot.mem.map(x=>Math.round(x*1000)/1000)}
<br>Долговременная:${robot.longMem.map(x=>Math.round(x*1000)/1000)}.
<br>Накопленная награда:${robot.totalReward}
<br>Рекорд прохождения:${robot.bestSteps}
<br>Для строительства выбрано:${modes[build]}`
let end=performance.now()
let dtW=Math.max(0,(dtMax-(end-start2)))
//console.log(dtW)
stableTime=stableTime*0.8+(dtMax-dtW)*0.2
picol.innerHTML+=`
<br>Стабильное время шага с оверхедами и т.д:${Math.round(stableTime*1000)/1000} мс
<br>Работа цикла:${(Math.round((end-start2))*1000)/1000} мс`
loop.last=setTimeout(loop,dtW,dtMax,lr,false)
end1=performance.now()
if(workingTime<1000){
workingTime+=end1-start
}else{
    workingTime+=dtMax
}
if(won){
    robot.allAchiv[robot.allAchiv.length-1][3]=workingTime
    workingTime=0
}
}
let idk=engine.addTile(tma,-10,-7.5,1)