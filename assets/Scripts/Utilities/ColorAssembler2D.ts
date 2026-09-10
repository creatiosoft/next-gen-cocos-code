// author: http://lamyoung.com/

const { ccclass, property, executeInEditMode, requireComponent, menu } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(cc.RenderComponent)
@menu('i18n:MAIN_MENU.component.renderers/ColorAssembler2D-lamyoung.com')
export default class ColorAssembler2D extends cc.Component {

    @property
    private _colors: cc.Color[] = [];
    @property({ type: [cc.Color] })
    public get colors() {
        return this._colors;
    }
    public set colors(colors) {
        this._colors = colors;
        cc.director.once(cc.Director.EVENT_AFTER_DRAW, this._updateColors, this);
    }

    onEnable() {
        cc.director.once(cc.Director.EVENT_AFTER_DRAW, this._updateColors, this);
    }

    onDisable() {
        cc.director.off(cc.Director.EVENT_AFTER_DRAW, this._updateColors, this);
        (this.node as any)._renderFlag |= (cc as any).RenderFlow.FLAG_COLOR;
    }

    private _updateColors() {
        const cmp = this.getComponent(cc.RenderComponent);
        if (!cmp) return;
        const _assembler = (cmp as any)._assembler;
        if (!(_assembler instanceof (cc as any).Assembler2D)) return;
        const uintVerts = _assembler._renderData.uintVDatas[0];
        if (!uintVerts) return;
        const color = this.node.color;
        const floatsPerVert = _assembler.floatsPerVert;
        const colorOffset = _assembler.colorOffset;
        const len = this.colors.length;
        let count = 0;
        for (let i = colorOffset, l = uintVerts.length; i < l; i += floatsPerVert) {
            const c = len > 0 ? this.colors[count++ % len] : undefined;
            uintVerts[i] = ((c || color) as any)._val;
        }
    }


}
