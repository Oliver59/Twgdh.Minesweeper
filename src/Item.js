/**
 * 元素
 */
Item = Class(Layer, {
    Index: 0,
    X: 0,
    Y: 0,
    Num: -1,//-1为地雷，0~8为数字
    nItemList: null,//邻居
    Game: null,
    over: false,
    /*
     * 状态
     *  0:普通
     *  1:打开
     *  2:小旗
     *  3:?1
     *  4:?2
     *  5:地雷1
     *  6:地雷2
     *  7:地雷3
     */
    Status: 0,
    /**是否可以点击*/
    Static:
	{
	    W: 16,
	    H: 16
	},
    IsTest: false,

    Item: function (index, x, y, num, dom) {
        this.Index = index;
        this.X = x;
        this.Y = y;
        this.Num = num;
        this.Layer();
        this.SetX(x * Item.W);
        this.SetY(y * Item.H);
        this.SetSize(Item.W, Item.H);
        this.SetBG(this.GetBg());
        this.Attach(dom);
    },

    SetNItemList: function (v) {
        this.nItemList = v;
    },
    GetBg: function () {
        var img = null;
        /*
        * 状态
        *  0:普通
        *  1:打开
        *  2:小旗
        *  3:?1
        *  4:?2
        *  5:地雷1
        *  6:地雷2
        *  7:地雷3
        */
        switch (this.Status) {
            case 0://0:普通
                img = Img.block;
                break;
            case 1://1:打开
                if (this.Num == -1) {
                    img = Img.mine1;
                } else {
                    img = Img["num" + this.Num];//数字 0~8
                }
                break;
            case 2://2:小旗
                img = Img.flag;
                break;
            case 3://3:?1
                img = Img.question1;
                break;
            case 4://4:?2
                img = Img.question2;
                break;
            case 5://5:地雷1
                img = Img.mine1;
                break;
            case 6://6:地雷2
                img = Img.mine2;
                break;
            case 7://7:地雷3
                img = Img.mine3;
                break;
        }
        if (this.IsTest) {
            img = Img["num0"];
        }
        return img.url + " -" + img.x + "px -" + img.y + "px";
    },
    SetStatus: function (v) {
        this.Status = v;
        this.SetBG(this.GetBg());
    },
    Test: function (v) {
        this.IsTest = v;
        this.SetBG(this.GetBg());
    },
    onmousedown: function (e) {
        this.Buttons = e.buttons;
        var itemObj = this.Item;
        if (itemObj.over) return;

        if (e.buttons == 1) {
            itemObj.Game.SetFaceStatus(2);
        }

        if (itemObj.Status == 0) {
            itemObj.Test(true);
            itemObj._div.onmouseout = function () {
                if (itemObj.IsTest) {
                    itemObj.Test(false);
                }
            }
        }
        if (e.buttons == 3) {
            if (itemObj.Status == 0 || itemObj.Status == 1) {
                if (itemObj.Status == 0) {
                    itemObj.Test(true);
                }
                for (var i = 0; i < itemObj.nItemList.length; i++) {
                    if (itemObj.nItemList[i].Status == 0) {
                        itemObj.nItemList[i].Test(true);
                    }
                }
                itemObj._div.onmouseout = function () {
                    if (itemObj.Status == 0 || itemObj.Status == 1) {
                        if (itemObj.Status == 0) {
                            itemObj.Test(false);
                        }
                        for (var i = 0; i < itemObj.nItemList.length; i++) {
                            if (itemObj.nItemList[i].IsTest) {
                                itemObj.nItemList[i].Test(false);
                            }
                        }
                    }
                }
            } else { }
        }
    },

    onmouseup: function (e) {
        var itemObj = this.Item;
        if (itemObj.over) return;
        itemObj.Test(false);
        itemObj.Game.SetFaceStatus(0);

        for (var i = 0; i < itemObj.nItemList.length; i++) {
            if (itemObj.nItemList[i].IsTest) {
                itemObj.nItemList[i].Test(false);
            }
        }
        itemObj.UpdateStatus(this.Buttons);
    }
    ,
    UpdateStatus: function (buttons) {
        /**
            e.buttons==1  鼠标左键
            e.buttons==2  鼠标右键
            e.buttons==3  鼠标左右键同时按下
         */

        switch (buttons) {
            case 1://鼠标左键
                //当前状态为 0、3、4 状态时点击有效
                if (this.Status == 0 || this.Status == 3 || this.Status == 4) {
                    if (!this.Game.IsStart) {
                        this.Game.Start();
                    }
                    if (this.Num == -1) {
                        //Game Over
                        this.SetStatus(6)
                        this.Game.GameOver();
                    } else {
                        this.SetStatus(1);
                        if (this.Num == 0) {
                            for (var i = 0; i < this.nItemList.length; i++) {
                                if (this.nItemList[i].Status == 0) {
                                    this.nItemList[i].UpdateStatus(1);
                                }
                            }
                        }
                        /**判断游戏是否胜利*/
                        this.Game.WhetherWin();
                    }
                }
                break;
            case 2://鼠标右键
                if (this.Status == 0) {//空→小旗
                    this.SetStatus(2);
                    this.Game.UpdateMineCount();
                }
                else if (this.Status == 2) {//小旗→问号
                    this.SetStatus(3);
                    this.Game.UpdateMineCount();
                }
                else if (this.Status == 3) {//问号→空
                    this.SetStatus(0);
                }

                break;
            case 3://鼠标左右键同时按下
                /*
                 * 判断小旗的个数？
                 *  如果小旗的个数等于显示的个数那么将 依次点击附近的格子
                 */

                if (this.Status == 1) {
                    var flagCount = 0;
                    for (var i = 0; i < this.nItemList.length; i++) {
                        flagCount += this.nItemList[i].Status == 2 ? 1 : 0;
                    }
                    if (flagCount == this.Num) {
                        for (var i = 0; i < this.nItemList.length; i++) {
                            if (this.nItemList[i].Status == 0) {
                                this.nItemList[i].UpdateStatus(1);
                            }
                        }
                    }
                }
                break;
        }
    }
});