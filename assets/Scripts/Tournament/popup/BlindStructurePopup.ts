import BlindStructureRow from "./BlindStructureRow";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlindStructurePopup extends cc.Component {

    @property(cc.ScrollView) scrollView: cc.ScrollView = null!;
    @property(cc.Node) rowPrefabNode: cc.Node = null!;

    private _currentLevel: number = 0;

    // Call this with blindRule data: { blindRuleArr: [...], currentBlindLevel: { level } }
    setData(data: any) {
        if (!data) return;

        const blindArr: any[] = data.blindRuleArr || data.blindLevels || [];
        this._currentLevel = data.currentBlindLevel?.level ?? data.currentLevel ?? 0;

        const rebuySet = new Set<number>(data.rebuyLevels ?? []);
        const addonSet = new Set<number>(data.addonLevels ?? []);

        const enriched = blindArr.map(item => ({
            ...item,
            isRebuy: rebuySet.has(item.level),
            isAddon: addonSet.has(item.level),
        }));

        this.buildList(enriched);
        // this.scrollToCurrentLevel(enriched);
    }

    private buildList(blindArr: any[]) {
        const content = this.scrollView.content;
        content.removeAllChildren();

        blindArr.forEach((item, index) => {
            const row = cc.instantiate(this.rowPrefabNode);
            content.addChild(row);
            row.getComponent(BlindStructureRow).setData(item, false, index % 2 === 1);
            row.active = true;
        });
    }

    private scrollToCurrentLevel(blindArr: any[]) {
        const idx = blindArr.findIndex(item => item.level === this._currentLevel);
        if (idx <= 0 || !this.scrollView.content.children[idx]) return;

        this.scheduleOnce(() => {
            const rowH = this.scrollView.content.children[0]?.height ?? 60;
            const totalH = this.scrollView.content.height;
            const viewH = this.scrollView.node.height;
            const targetY = idx * rowH;
            const maxScroll = Math.max(0, totalH - viewH);
            const scrollY = Math.min(targetY, maxScroll);
            this.scrollView.scrollToOffset(cc.v2(0, scrollY), 0.3);
        }, 0.1);
    }

    onClose() {
        this.node.active = false;
    }

    show(data: any) {
        this.node.active = true;
        this.setData(data);
    }
}
