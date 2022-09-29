var doc = window.document;


var run_flag = true;

function Constructor(init) {
    return function () {
        if (run_flag)
            init.apply(this, arguments);
    }
}

function ToString(str) {
    return function () {
        return str;
    }
}

Class = function (base, member) {
    if (!member)// 如果传递一个参数 将base 与 member 交换
    {
        member = base;
        base = null;
    }

    var S = member.Static;
    //原型
    var proto = member;
    var F, k;


    if (base) {
        //如果存在基类，那么将 proto 中的

        run_flag = false;
        proto = new base;
        run_flag = true;


        for (k in member)
            proto[k] = member[k];
    }

    //
    // 约定第一个function作为构造函数
    //
    for (k in member) {
        if (typeof member[k] == "function")
            break;
    }

    F = Constructor(member[k]);

    proto.constructor = F;
    F.prototype = proto;
    F.toString = ToString("[class " + k + "]");

    for (k in S)
        F[k] = S[k];

    return F;
}


/**
 * Class Game
 */
var Game = function (_level) {
    this.Level = _level;
    this.ItemList = null;
    this.TallyList = null;//计数器
    this.Time = 0;
    this.MineCount = _level.Mine;
    this.FaceStatus = 0;
    this.Face = null;
    this.MineCountTally = null;
    this.TimeTally = null;
    this.IsStart = false;
}

Game.prototype.init = function () {
    /**初始化窗体的高度、宽度信息*/
    //-159  246
    var mineContainerH = 16 * this.Level.H;
    var mineContainerW = 16 * this.Level.W;
    document.getElementById("MineContainer").style.height = mineContainerH + "px";
    var mainW = mineContainerW + 15;
    document.getElementById("main").style.width = mainW + "px";
    var mainH = 102 + mineContainerH;
    document.getElementById("main").style.height = mainH + "px";

    /**Tally 初始化*/
    this.MineCountTally = new Tally(5, 5, document.getElementById("TallyContainer"));
    this.TimeTally = new Tally(mineContainerW-45, 5, document.getElementById("TallyContainer"));
    this.MineCountTally.SetValue(this.Level.Mine);
    this.TimeTally.SetValue(0);

    /**初始化笑脸*/
    var face = new Layer();
    this.Face = face;
    face.SetSize(26, 26);
    face.SetX((mineContainerW - 26) / 2);
    face.SetY(4);
    face.Attach(document.getElementById("TallyContainer"))
    var game = this;
    face._div.onmousedown = function () {
        game.SetFaceStatus(1);
        this.onmouseout = function () {
            game.SetFaceStatus(0);
        }
    }

    this.SetFaceStatus(0);

    /*ItemList初始化**/
    this.ItemList = [];
    var index = 0;
    var mineMap = this.GetMineMap();
    var index = 0;
    for (var j = 0; j < this.Level.H; j++) {
        for (var i = 0; i < this.Level.W; i++) {
            var item = new Item(index, i, j, mineMap[index], document.getElementById("MineContainer"));
            this.ItemList.push(item);
            index++;
        }
    }

    for (var i = 0; i < this.ItemList.length; i++) {
        var item = this.ItemList[i];
        var index = item.Index;
        var neighborList = this.GetNeighbor(i);
        var nItemList = [];
        for (var nIndex in neighborList) {
            nItemList.push(this.ItemList[neighborList[nIndex]]);
        }
        item.SetNItemList(nItemList);
        item.Game = this;
    }
}

/*游戏结束*/
Game.prototype.GameOver = function () {
    for (var i = 0; i < this.ItemList.length; i++) {
        var item = this.ItemList[i];
        item.over = true;
        if (item.Status == 2 && item.Num != -1) {
            //红旗插错了
            item.SetStatus(7);
        }
        if (item.Status == 2 && item.Num == -1) {
            //红旗插对了
        } else if (item.Num == -1 && item.Status != 6) {
            //未找的地雷
            item.SetStatus(5);
        }
    }
    this.SetFaceStatus(4);
    clearInterval(this.T);
}

/*
 *判断游戏是否胜利，胜利则结束，否则返回
 *  条件：所有的数字均被打开
 */
Game.prototype.WhetherWin = function () {

    for (var i = 0; i < this.ItemList.length; i++) {
        var item = this.ItemList[i];
        if (item.Num >= 0) {//说明该位置为数字
            if (item.Status != 1) {
                // 该位置没有打开
                return;
            }
        }
    }

    for (var i = 0; i < this.ItemList.length; i++) {
        var item = this.ItemList[i];
        if (item.Num == -1) {
            //该位置是地雷
            item.SetStatus(2);
        }
    }
    this.UpdateMineCount();
    this.GameOver();
    this.SetFaceStatus(3);
}
/*
 * 根据级别得到雷的索引
 */
Game.prototype.GetMineMap = function () {
    var w = this.Level.W;
    var h = this.Level.H;
    var itemCount = w * h;
    var mineCount = this.Level.Mine;
    var mineList = [];
    for (var i = 0; i < mineCount; i++) {
        var mineIndex = Math.round(Math.random() * itemCount);
        if (mineList.indexOf(mineIndex) == -1) {
            mineList.push(mineIndex);
        } else {
            i--;
        }
    }
    var mineMap = [];
    for (var i = 0; i < itemCount; i++) {
        var index = mineList.indexOf(i);
        if (index >= 0) {
            //说明该位置是地雷
            mineMap[i] = -1;
        }
    }
    for (var i = 0; i < itemCount; i++) {
        var isMine = mineList.indexOf(i) > -1;
        if (!isMine) {
            //说明该位置不是地雷，而是数字
            var neighborList = this.GetNeighbor(i);
            var neighborMineCount = 0;
            for (var j = 0; j < neighborList.length; j++) {
                neighborMineCount += mineMap[neighborList[j]] == -1 ? 1 : 0;
            }
            mineMap[i] = neighborMineCount;
        }
    }
    return mineMap;
}

/*得到邻居*/
Game.prototype.GetNeighbor = function (index) {
    var i = index;
    var w = this.Level.W;
    var h = this.Level.H;
    /**
    *索引分别为0-7
    *  --------------------
    * |  0  | 1 |  2  |
    * |i-w-1|i-w|i-w+1|
    * --------------------
    * |  3  |   |  4  |
    * | i-1 | i | i+1 |
    * --------------------
    * |  5  | 6 |  7  |
    * |i+w-1|i+w|i+w+1|
    * --------------------
    * w=4 h=3
    * 0 1  2  3
    * 4 5  6  7
    * 8 9 10 11
    * 
    */
    var temp = [];
    temp[0] = i - w - 1;
    temp[1] = i - w;
    temp[2] = i - w + 1;
    temp[3] = i - 1;
    temp[4] = i + 1;
    temp[5] = i + w - 1;
    temp[6] = i + w;
    temp[7] = i + w + 1;
    if (i < w) {//无上
        temp[0] = temp[1] = temp[2] = -1;
    }
    if (i % w == 0) {//无左
        temp[0] = temp[3] = temp[5] = -1;
    }
    if ((i + 1) % w == 0) {//无右
        temp[2] = temp[4] = temp[7] = -1;
    }
    if (i >= h * w - w) {//无下
        temp[5] = temp[6] = temp[7] = -1;
    }
    var neighborList = [];
    for (var j = 0; j < temp.length; j++) {
        if (temp[j] != -1) {
            neighborList.push(temp[j]);
        }
    }
    return neighborList;
}

/*得到笑脸的背景图片*/
Game.prototype.SetFaceStatus = function (v) {
    this.FaceStatus = v;
    var img = Img["face" + v];
    this.Face.SetBG(img.url + " -" + img.x + "px -" + img.y + "px");
}
/**设置剩余地雷个数*/
Game.prototype.UpdateMineCount = function () {
    var mineCount = 0;
    for (var i = 0; i < this.ItemList.length; i++) {
        if (this.ItemList[i].Status == 2) {
            mineCount++;
        }
    }
    this.MineCount = this.Level.Mine - mineCount;
    if (this.MineCount < 0) {
        this.MineCount = 0;
    }
    this.MineCountTally.SetValue(this.MineCount);
}
/*开始游戏*/
Game.prototype.Start = function () {
    this.IsStart = true;
    var game = this;
    this.T = setInterval(function () {
        game.SetTimeValue(game.Time + 1);
    }, 1000);
}

Game.prototype.SetTimeValue = function (v) {
    this.Time = v;
    this.TimeTally.SetValue(this.Time);
}

/**
 * 级别:
 *      高级:30*16    99雷
 *      中级:16*16    40雷
 *      初级:9*9      10雷
 */
var Level = {
    Level1: { W: 9, H: 9, Mine: 10 },
    Level2: { W: 16, H: 16, Mine: 40 },
    Level3: { W: 30, H: 16, Mine: 99 }
};


var Img = {
    num1: { url: "url(img/i.png)", x: 2, y: 70, w: 16, h: 16 },
    num2: { url: "url(img/i.png)", x: 19, y: 70, w: 16, h: 16 },
    num3: { url: "url(img/i.png)", x: 36, y: 70, w: 16, h: 16 },
    num4: { url: "url(img/i.png)", x: 53, y: 70, w: 16, h: 16 },
    num5: { url: "url(img/i.png)", x: 70, y: 70, w: 16, h: 16 },
    num6: { url: "url(img/i.png)", x: 87, y: 70, w: 16, h: 16 },
    num7: { url: "url(img/i.png)", x: 104, y: 70, w: 16, h: 16 },
    num8: { url: "url(img/i.png)", x: 121, y: 70, w: 16, h: 16 },
    block: { url: "url(img/i.png)", x: 2, y: 53, w: 16, h: 16 },
    num0: { url: "url(img/i.png)", x: 19, y: 53, w: 16, h: 16 },
    flag: { url: "url(img/i.png)", x: 36, y: 53, w: 16, h: 16 },
    question1: { url: "url(img/i.png)", x: 53, y: 53, w: 16, h: 16 },
    question2: { url: "url(img/i.png)", x: 70, y: 53, w: 16, h: 16 },
    mine1: { url: "url(img/i.png)", x: 87, y: 53, w: 16, h: 16 },
    mine2: { url: "url(img/i.png)", x: 104, y: 53, w: 16, h: 16 },
    mine3: { url: "url(img/i.png)", x: 121, y: 53, w: 16, h: 16 },


    tally1: { url: "url(img/i.png)", x: 2, y: 2, w: 13, h: 23 },
    tally2: { url: "url(img/i.png)", x: 16, y: 2, w: 13, h: 23 },
    tally3: { url: "url(img/i.png)", x: 30, y: 2, w: 13, h: 23 },
    tally4: { url: "url(img/i.png)", x: 44, y: 2, w: 13, h: 23 },
    tally5: { url: "url(img/i.png)", x: 58, y: 2, w: 13, h: 23 },
    tally6: { url: "url(img/i.png)", x: 72, y: 2, w: 13, h: 23 },
    tally7: { url: "url(img/i.png)", x: 86, y: 2, w: 13, h: 23 },
    tally8: { url: "url(img/i.png)", x: 100, y: 2, w: 13, h: 23 },
    tally9: { url: "url(img/i.png)", x: 114, y: 2, w: 13, h: 23 },
    tally0: { url: "url(img/i.png)", x: 128, y: 2, w: 13, h: 23 },



    face0: { url: "url(img/i.png)", x: 2, y: 26, w: 26, h: 26 },
    face1: { url: "url(img/i.png)", x: 29, y: 26, w: 26, h: 26 },
    face2: { url: "url(img/i.png)", x: 56, y: 26, w: 26, h: 26 },
    face3: { url: "url(img/i.png)", x: 83, y: 26, w: 26, h: 26 },
    face4: { url: "url(img/i.png)", x: 110, y: 26, w: 26, h: 26 }

}

