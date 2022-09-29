/*
 * 计数器
 */
Tally = Class({
    Value: 0,
    List: null,
    Static:
    {
        W: 13,
        H: 23
    },
    Tally: function (x, y,dom) {
        this.List = [];
        for (var i = 0; i < 3; i++) {
            var layer = new Layer();
            layer.Attach(dom)

            layer.SetX(x + (i * Tally.W));
            layer.SetY(y );
            layer.SetSize(Tally.W, Tally.H);

            this.List.push(layer);
        }
    },
    SetValue: function (v) {
        this.Value = v;
        var v1 = parseInt(v / 100);
        var v2 = parseInt(v % 100 / 10);
        var v3 = parseInt(v % 10);

        this.List[0].SetBG(this.GetBG(v1));
        this.List[1].SetBG(this.GetBG(v2));
        this.List[2].SetBG(this.GetBG(v3));


    }, GetBG: function (v) {
        var img = Img["tally" + v];
        return img.url + " -" + img.x + "px -" + img.y + "px";
    }
});