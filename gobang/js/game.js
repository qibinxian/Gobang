(()=>{
    'use strict'
    class Gobang{
        constructor(){
            this.app = new PIXI.Application({ 
                width: 750, 
                height: 1200, 
                // antialias: true,     //消除锯齿                      
                antialiasing: true, 
                transparent: false, 
                backgroundColor: 0xe8c06f,
                resolution: 1
            });
            
            this.width = 15;//格子宽
            this.height = 15;//格子高
            this.padding = 25;//格子左右间距
            this.marginTop = 100;//格子顶部距离
            this.spacing = null;//格子间距
            this.title = '五子棋';//标题

            
            this.playOneColor = 0x000000;
            this.playTwoColor = 0xFFFFFF;
            this.step = this.width * this.height;
            this.chessData = new Array(this.height);//棋盘数据
            this.allChess = [];
            this.init();
            // this.resize();
            // window.addEventListener('resize',()=>{
            //     this.resize();
            // })
        }
        init(){
            document.querySelector('.Mapping').appendChild(this.app.view);
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
            this.Reset();
            
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            this.container.width = this.clientWidth = this.app.screen.width;
            this.container.height = this.clientHeight = this.app.screen.height;
            // this.container.pivot.x = this.container.width >> 1;
            // this.container.pivot.y = this.container.height >> 1;
            this.drawRect();
            this.drawBtn();
            this.container.interactive = true;
            this.container.hitArea = new PIXI.Rectangle(this.padding, this.padding + this.marginTop, this.clientWidth - (this.padding << 1),this.clientWidth - (this.padding << 1));
            this.container.on('pointertap', this.onClick.bind(this));
        }
        Reset(){
            this.isWhite = false;//黑子先手
            this.winner = ''//获胜方
            for(let i = 0; i < this.height; i++) {
                this.chessData[i] = new Array(this.width);
                for(let j = 0; j < this.width; j++) {
                    this.chessData[i][j] = 0;
                }
            }
            for(let i = 0; i < this.allChess.length; i++) {
                this.allChess[i].destroy();
            }
            this.allChess.length = 0;
        }
        revoked(){
            if(!this.winner){
                if(this.allChess.length >= 2){
                    for(let i = 0; i < 2; i++ ) {
                        this.chessData[this.allChess[this.allChess.length - 1].coory][this.allChess[this.allChess.length - 1].coorx] = 0;
                        this.allChess[this.allChess.length - 1].destroy();
                        this.allChess.length--;
                    }
                }
            }
        }
        resize(){
            // console.log(window.innerWidth,window.innerHeight)
            // console.log(window.devicePixelRatio)
            // console.log(document.documentElement.clientWidth,document.documentElement.clientHeight)
            this.app.view.style.display = 'block';
            this.app.view.style.width = document.documentElement.clientWidth + 'px';
            this.app.view.style.height = document.documentElement.clientHeight + 'px';
        }
        drawRect(){
            // 标题
            const style = new PIXI.TextStyle({
                fontFamily : 'Arial',
                fontSize : 36,
                // align : 'center',
                wordWrap: true,
                wordWrapWidth : 400,
            })
            const basicText = new PIXI.Text(this.title, style);
            // console.log(basicText.width)
            basicText.x = this.clientWidth - basicText.width >> 1;
            basicText.y = 50;
            this.container.addChild(basicText);

            // 棋盘网格
            const realPath = new PIXI.Graphics();
            for(let i = 0; i < this.width; i++) {
                realPath.lineStyle(2, 0x000000,1);//宽 颜色 透明度
                this.spacing = this.spacing || (this.clientWidth - (this.padding << 1)) / (this.width - 1);
                const x = this.padding + i * this.spacing;
                const y1 = this.padding + this.marginTop;
                const y2 = y1 + this.clientWidth - (this.padding << 1);
                realPath.moveTo(x, y1);
                realPath.lineTo(x, y2);
                realPath.closePath();
            }
            for(let i = 0; i < this.width; i++) {
                realPath.lineStyle(2, 0x000000,1);
                const y = this.padding + i * this.spacing + this.marginTop;
                const x1 = this.padding;
                const x2 = x1 + this.clientWidth - (this.padding << 1);
                realPath.moveTo(x1, y);
                realPath.lineTo(x2, y);
                realPath.closePath();
            }
            this.container.addChild(realPath);
        }
        drawBtn(){
            this.reopen = new PIXI.Container();
            const basicText = new PIXI.Text('重新开始');
            this.reopen.interactive = true;
            this.reopen.addChild(basicText);
            basicText.x = basicText.y = 5;
            this.reopen.x = this.padding;
            this.reopen.y = this.padding + this.height * this.spacing + this.marginTop;
            this.reopen.hitArea = new PIXI.Rectangle(0, 0, basicText.width + 10, basicText.width + 10);
            this.app.stage.addChild(this.reopen);
            this.reopen.on('pointertap', this.Reset.bind(this));

            this.revoke = new PIXI.Container();
            const basicText2 = new PIXI.Text('悔棋撤销');
            this.revoke.interactive = true;
            this.revoke.addChild(basicText2);
            basicText2.x = basicText2.y = 5;
            this.revoke.x = this.padding + basicText.width * 2;
            this.revoke.y = this.padding + this.height * this.spacing + this.marginTop;
            this.revoke.hitArea = new PIXI.Rectangle(0, 0, basicText2.width + 10, basicText2.width + 10);
            this.app.stage.addChild(this.revoke);
            this.revoke.on('pointertap', this.revoked.bind(this));
        }
        onClick(event){
            if (!this.winner) {
                if(this.isWhite) {
                    alert('现在是电脑时间');
                } else {
                    this.target = event.target;
                    this.data = event.data;
                    const newPosition = this.data.getLocalPosition(this.target.parent);
                    const posx = newPosition.x;
                    const posy = newPosition.y;
                    const x = Math.round((posx - this.padding) / this.spacing);
                    const y = Math.round((posy - this.padding - this.marginTop) / this.spacing);
                    // console.log(`你点击了第${y}行，第${x}列的格子`);
                    if(this.chessData[y][x] === 0) {
                        this.drawChess(1,x,y);
                    } else {
                        alert('当前区域不可落子');
                    }
                }
            } else {
                alert('游戏已经结束，请开始新游戏');
            }
        }
        
        drawChess(i = 1, x, y){
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(0);
            this.chessData[y][x] = i;
            this.isWin(i, x, y);
            if (i === 1) {
                graphics.beginFill(this.playOneColor, 1);
                this.isWhite = true;
                if(!this.winner){
                    this.AIplay();
                }
            } else if (i === 2) {
                graphics.beginFill(this.playTwoColor, 1);
                this.isWhite = false;
            }
            graphics.drawCircle(x * this.spacing + this.padding, y * this.spacing + this.padding + this.marginTop, (this.spacing >> 1) - 5);
            graphics.endFill();
            graphics.coorx = x;
            graphics.coory = y;
            this.allChess.push(graphics);
            this.container.addChild(graphics);
            if( --this.step == 0){
                this.winner = "和局";
                alert(this.winner);
            }
        }
        isWin(temp, x, y){
            this.lrCount(temp, x, y);
            this.tbCount(temp, x, y);
            this.lbCount(temp, x, y);
            this.rbCount(temp, x, y);
        }
        lrCount(temp, x, y){
            let line = new Array(4);
            let count = 0;
            line[1] = y;
            line[3] = y;
            for (let i = x; i >= 0; i--) {
                if (this.chessData[y][i] == temp) {
                    line[0] = i;
                    ++count;
                } else {
                    i = -1;
                }
            }
            for (let i = x; i < this.width; i++) {
                if (this.chessData[y][i] == temp) {
                    line[2] = i;
                    ++count;
                } else {
                    i = this.width;
                }
            }
            this.success(line, temp, --count);
        }
        tbCount(temp, x, y){
            let line = new Array(4);
            let count = 0;
            line[0] = x;
            line[2] = x;
            for (let i = y; i >= 0; i--) {
                if (this.chessData[i][x] == temp) {
                    ++count;
                    line[1] = i;
                } else {
                    i = -1;
                }
            }
            for (let i = y; i < this.height; i++) {
                if (this.chessData[i][x] == temp) {
                    ++count;
                    line[3] = i;
                } else {
                    i = this.height;
                }
            }
            this.success(line, temp, --count);
        }
        lbCount(temp, x , y) {
            let line = new Array(4);
            let count = 0;
            for (let i = x, j = y; i >= 0 && j >= 0; ) {
                if(this.chessData[j][i] == temp){
                    line[0] = i;
                    line[1] = j;
                    ++count;
                } else {
                    i = -1, j = -1;
                }
                i--, j--;
            }
            for (let i = x, j = y; i < this.width && j < this.height; ) {
                if(this.chessData[j][i] == temp){
                    line[2] = i;
                    line[3] = j;
                    ++count;
                } else {
                    i = this.width, j = this.height;
                }
                i++, j++;
            }
            this.success(line, temp, --count);
        }
        rbCount(temp, x, y) {
            let line = new Array(4);
            let count = 0;
            for (let i = x, j = y; i < this.width && j >= 0; ) {
                if(this.chessData[j][i] == temp){
                    line[0] = i;
                    line[1] = j;
                    ++count;
                } else {
                    i = this.width, j = -1;
                }
                i++, j--;
            }
            for (let i = x, j = y; i >= 0 && j < this.height; ) {
                if(this.chessData[j][i] == temp){
                    line[2] = i;
                    line[3] = j;
                    ++count;
                } else {
                    i = -1, j = this.height;
                }
                i--, j++;
            }
            this.success(line, temp, --count);
        }
        success(line, temp, count){
            if(count >= 5){
                console.log(`棋子连线是从${line[0]},${line[1]}到${line[2]},${line[3]}`);
                if(temp == 1) {
                    console.log(`At the end of the game, the winner is player。`);
                    console.log(`游戏结束，获胜方是玩家。`);
                    this.winner = "黑棋胜利!";
                } else {
                    console.log(`At the end of the game, the winner is the computer.`);
                    console.log(`游戏结束，获胜方是电脑。`);
                    this.winner = "白棋胜利!";
                }
                alert(this.winner);

            }
        }
        /**五子棋AI
            *思路：对棋盘上的每一个空格进行估分，电脑优先在分值高的点落子
            * 棋型：
            * 〖五连〗只有五枚同色棋子在一条阳线或阴线上相邻成一排
            * 〖成五〗含有五枚同色棋子所形成的连，包括五连和长连。
            * 〖活四〗有两个点可以成五的四。
            * 〖冲四〗只有一个点可以成五的四。
            * 〖死四〗不能成五的四。
            * 〖三〗在一条阳线或阴线上连续相邻的5个点上只有三枚同色棋子的棋型。
            * 〖活三〗再走一着可以形成活四的三。
            * 〖连活三〗即：连的活三（同色棋子在一条阳线或阴线上相邻成一排的活三）。简称“连三”。
            * 〖跳活三〗中间隔有一个空点的活三。简称“跳三”。
            * 〖眠三〗再走一着可以形成冲四的三。
            * 〖死三〗不能成五的三。
            * 〖二〗在一条阳线或阴线上连续相邻的5个点上只有两枚同色棋子的棋型。
            * 〖活二〗再走一着可以形成活三的二。
            * 〖连活二〗即：连的活二（同色棋子在一条阳线或阴线上相邻成一排的活二）。简称“连二”。
            * 〖跳活二〗中间隔有一个空点的活二。简称“跳二”。
            * 〖大跳活二〗中间隔有两个空点的活二。简称“大跳二”。
            * 〖眠二〗再走一着可以形成眠三的二。
            * 〖死二〗不能成五的二。
            * 〖先手〗对方必须应答的着法，相对于先手而言，冲四称为“绝对先手”。
            * 〖三三〗一子落下同时形成两个活三。也称“双三”。
            * 〖四四〗一子落下同时形成两个冲四。也称“双四”。
            * 〖四三〗一子落下同时形成一个冲四和一个活三。
            * 分值表
            * 成5:100000分
            * 活4：10000分
            * 活3+冲4:5000分
            * 眠3+活2：2000分
            * 眠2+眠1:1分
            * 死棋即不能成5的是0分
            * @return {[type]} [description]
        */
        AIplay(){
            let a = new Array(2);
            let score = 0;
            for(let i = 0; i < this.height; i++) {
                for(let j = 0; j < this.width; j++) {
                    if(this.chessData[i][j] == 0){
                        const judgeNum = this.judge(j, i);
                        if(judgeNum > score){
                            score = judgeNum;
                            a[0] = j;
                            a[1] = i;
                        }
                    }
                }
            }
            this.drawChess(2,a[0],a[1])
        }
        judge(x, y){//加权求值
            const a = parseInt(this.leftRight(x, y, 2)) + parseInt(this.topBottom(x, y, 2)) + parseInt(this.leftBottom(x, y, 2)) + parseInt(this.rightBottom(x, y, 2)) + 100; //判断白棋走该位置的得分 加100是保证当前处于先手位置
            const b = parseInt(this.leftRight(x, y, 1)) + parseInt(this.topBottom(x, y, 1)) + parseInt(this.leftBottom(x, y, 1)) + parseInt(this.rightBottom(x, y, 1)); //判断黑棋走该位置的得分
            const result = a + b;
            // console.log(`我计算出了${x},${y}这个位置的得分为${result}`);
            return result; //返回黑白棋下该位置的总和
        }
        leftRight(x, y, num){//左右
            let death = 0; //0表示两边都没堵住,且可以成5，1表示一边堵住了，可以成5,2表示是死棋，不予考虑
            let live = 0;//可添加棋子的空位个数
            let count = 0;//已连接的数量
            let arr = [];
            for (let i = 0; i < this.chessData.length; i++) {
                arr[i] = this.chessData[i].concat();
            }//克隆新数组
            arr[y][x] = num;
            for(let i = x; i >= 0; i--) {
                if (arr[y][i] == num) {
                    count++;
                } else if (arr[y][i] == 0) {
                    live++; //空位标记
                    i = -1;
                } else {
                    death++;
                    i = -1;
                }
            }
            for(let i = x; i < this.width; i++) {
                if (arr[y][i] == num) {
                    count++;
                } else if (arr[y][i] == 0) {
                    live++; 
                    i = this.width;
                } else {
                    death++;
                    i = this.width;
                }
            }
            count--;
            return this.model(count, death);
        }
        topBottom(x, y, num){
            let death = 0;
            let live = 0;
            let count = 0;
            let arr = [];
            for (let i = 0; i < this.chessData.length; i++) {
                arr[i] = this.chessData[i].concat();
            }
            arr[y][x] = num;
            for (let i = y; i >= 0; i--) {
                if (arr[i][x] == num) {
                    count++;
                } else if (arr[i][x] == 0) {
                    live++;
                    i = -1;
                } else {
                    death++;
                    i = -1;
                }
            }
            for (let i = y; i < this.height; i++) {
                if (arr[i][x] == num) {
                    count++;
                } else if (arr[i][x] == 0) {
                    live++;
                    i = this.height;
                } else {
                    death++;
                    i = this.height;
                }
            }
            count--;
            return this.model(count, death);
        }
        leftBottom(x, y, num){
            let death = 0;
            let live = 0;
            let count = 0;
            let arr = [];
            for (let i = 0; i < this.chessData.length; i++) {
                arr[i] = this.chessData[i].concat();
            }
            arr[y][x] = num;
            for (let i = x, j = y; i >= 0 && j >= 0; ) {
                if (arr[j][i] == num) {
                    count++;
                } else if (arr[j][i] == 0) {
                    live++;
                    i = -1;
                } else {
                    death++;
                    i = -1;
                }
                i--, j--;
            }
            for (let i = x, j = y; i < this.width && j < this.height; ) {
                if (arr[j][i] == num) {
                    count++;
                } else if (arr[j][i] == 0) {
                    live++;
                    i = this.width;
                } else {
                    death++;
                    i = this.width;
                }
                i++, j++;
            }
            count--;
            return this.model(count, death);
        }
        rightBottom(x, y, num){
            let death = 0;
            let live = 0;
            let count = 0;
            let arr = [];
            for (let i = 0; i < this.chessData.length; i++) {
                arr[i] = this.chessData[i].concat();
            }
            arr[y][x] = num;
            for (let i = x, j = y; i >= 0 && j < this.height; ) {
                if (arr[j][i] == num) {
                    count++;
                } else if (arr[j][i] == 0) {
                    live++;
                    i = -1;
                } else {
                    death++;
                    i = -1;
                }
                i--, j++;
            }
            for (let i = x, j = y; i < this.width && j >= 0; ) {
                if (arr[j][i] == num) {
                    count++;
                } else if (arr[j][i] == 0) {
                    live++;
                    i = this.width;
                } else {
                    death++;
                    i = this.width;
                }
                i++, j--;
            }
            count--;
            return this.model(count, death);
        }

        model(count, death){
            const LEVEL_ONE = 0;//单子
            const LEVEL_TWO = 1;//眠2，眠1
            const LEVEL_THREE = 1500;//眠3，活2
            const LEVEL_FOER = 4000;//冲4，活3
            const LEVEL_FIVE = 10000;//活4
            const LEVEL_SIX = 100000;//成5
            // console.log(count,death)
            if (count == 1 && death == 1) {
                return LEVEL_TWO; //眠1
            } else if (count == 2) {
                if (death == 0) {
                    return LEVEL_THREE; //活2
                } else if (death == 1) {
                    return LEVEL_TWO; //眠2
                } else {
                    return LEVEL_ONE; //死棋
                }
            } else if (count == 3) {
                if (death == 0) {
                    return LEVEL_FOER; //活3
                } else if (death == 1) {
                    return LEVEL_THREE; //眠3
                } else {
                    return LEVEL_ONE; //死棋
                }
            } else if (count == 4) {
                if (death == 0) {
                    return LEVEL_FIVE; //活4
                } else if (death == 1) {
                    return LEVEL_FOER; //冲4
                } else {
                    return LEVEL_ONE; //死棋
                }
            } else if (count == 5) {
                return LEVEL_SIX; //成5
            }
            return LEVEL_ONE;
        }
    }
    new Gobang()
})();