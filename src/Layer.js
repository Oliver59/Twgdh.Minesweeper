Layer = Class(
{
    _div: null, _sty: null,


    Layer: function () {
        this._div = doc.createElement("div");
        this._sty = this._div.style;

        this._sty.position = "absolute";
        this._sty.overflow = "hidden";

        this._div.Item = this;
        if (typeof (this.onmousedown) == "function")
            this._div.onmousedown = this.onmousedown;
        if (typeof (this.onmouseup) == "function")
            this._div.onmouseup = this.onmouseup;
    },

    X: 0,
    SetX:
		function (v) { this._sty.left = (this.X = v) + "px" },
    Y: 0,
    SetY:
		function (v) { this._sty.top = (this.Y = v) + "px" },
    Width: 0,
    SetWidth:
			function (v) { this._sty.width = (this.Width = v) + "px" },
    Height: 0,
    SetHeight:
			function (v) { this._sty.height = (this.Height = v) + "px" },
    Z: -1,
    SetZ:
		function (v) { this._sty.zIndex = v },

    SetSize:
		function (w, h) {
		    this.SetWidth(w);
		    this.SetHeight(h);
		},

    Move:
		function (x, y) {
		    this.SetX(x);
		    this.SetY(y);
		},
    MoveBy:
		function (dx, dy) {
		    this.Move(this.X + dx, this.Y + dy);
		},
    Visible: true,
    SetVisible:
			function (v) {
			    if (this.Visible != v) {
			        this.Visible = v;
			        this._sty.display = v ? "block" : "none";
			    }
			},
    Show:
		function () { this.SetVisible(true) },
    Hide:
		function () { this.SetVisible(false) },

    SetBG:
		function (v) { this._sty.background = v },
    SetClass:
		function (name) { this._div.className = name },

    Append:
		function (layer) {
		    if (layer instanceof Layer) {
		        this._div.appendChild(layer._div)
		        return this;
		    }

		    return Error("Argument must be a Layer type");
		},

    Attach:
		function (dom) { dom.appendChild(this._div) }
});