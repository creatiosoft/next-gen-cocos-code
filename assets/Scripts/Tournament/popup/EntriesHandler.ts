
import EntriesRow from "./EntriesRow";
import { YXCollectionView } from "../../Lib/yx-collection-view";
import { YXTableLayout } from "../../Lib/yx-table-layout";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EntriesHandler extends cc.Component {

    @property(cc.Label) enrolledLabel: cc.Label = null!;
    @property(cc.Node) scrollView: cc.Node = null!;
    @property(cc.Prefab) rowPrefabNode: cc.Prefab = null!;

    // ===== 分帧相关 =====
    private _itemNodes: cc.Node[] = [];
    private _itemPool: cc.Node[] = [];
    private _pendingRows: any[] = [];
    private _createIndex: number = 0;
    private _isCreating: boolean = false;
    private _hasCreatedItems: boolean = false;
    private _batchSize: number = 8;          // 每帧创建几个，可按需要调整
    private ITEM_HEIGHT: number = 80;        // 请改成你实际的行高

    start() {
        const listComp = this.scrollView.getComponent(YXCollectionView);
        listComp.numberOfItems = () => this._pendingRows.length;
        listComp.cellForItemAt = (indexPath, collectionView) => {
            const cell = collectionView.dequeueReusableCell(`cell-entry`)
            const p = this._pendingRows[indexPath.row];
            
            const comp = cell.getComponent(EntriesRow);
            if (comp) {
                comp.setData(p, indexPath.row % 2 === 1);
            }
            return cell;
        };

        let layout = new YXTableLayout();
        layout.spacing = 0;
        layout.rowHeight = 92;
        listComp.layout = layout;

        listComp.reloadData();
    }

    setData(data: any) {
        if (!data) return;

        const entries: any[] = data.entries || data.players || [];
        const enrolledCount = data.enrolledCount ?? data.totalEntries ?? entries.length;

        if (this.enrolledLabel) {
            this.enrolledLabel.string = `${enrolledCount}`;
        }

        // 第一次：分帧创建
        // if (!this._hasCreatedItems) {
        this._pendingRows = entries;
        //     this._createIndex = 0;
        //     if (!this._isCreating) {
        //         this._isCreating = true;
        //         this.startCreateItems();
        //     }
        // } else {
        //     // 已经创建过：只更新
        //     this.updateExistingItems(entries);
        // }

        const listComp = this.scrollView.getComponent(YXCollectionView);
        listComp.numberOfItems = () => this._pendingRows.length;
        listComp.reloadData();
    }

    private startCreateItems() {
        const content = this.scrollView.content;

        // 回收旧节点（防御性）
        const children = content.children.slice();
        for (const node of children) {
            node.removeFromParent(false);
            this._itemPool.push(node);
        }
        this._itemNodes = [];

        // 提前设置高度
        const totalHeight = this._pendingRows.length * this.ITEM_HEIGHT;
        content.height = Math.max(totalHeight, content.parent.height);

        this.createNextBatch();
    }

    private createNextBatch() {
        if (this._createIndex >= this._pendingRows.length) {
            this._isCreating = false;
            this._hasCreatedItems = true;
            return;
        }

        const content = this.scrollView.content;
        const end = Math.min(this._createIndex + this._batchSize, this._pendingRows.length);

        for (let i = this._createIndex; i < end; i++) {
            const itemData = this._pendingRows[i];
            let row: cc.Node;

            if (this._itemPool.length > 0) {
                row = this._itemPool.pop()!;
            } else {
                row = cc.instantiate(this.rowPrefabNode);
            }

            row.active = true;
            content.addChild(row);
            this._itemNodes.push(row);

            // 设置位置
            row.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
            row.x = 0;

            const comp = row.getComponent(EntriesRow);
            if (comp) {
                comp.setData(itemData, i % 2 === 1);
            }
        }

        this._createIndex = end;
        this.scheduleOnce(() => this.createNextBatch(), 0);
    }

    private updateExistingItems(entries: any[]) {
        const content = this.scrollView.content;
        const count = Math.min(entries.length, this._itemNodes.length);

        // 更新已有节点
        for (let i = 0; i < count; i++) {
            const itemData = entries[i];
            const row = this._itemNodes[i];

            row.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
            row.x = 0;
            row.active = true;

            const comp = row.getComponent(EntriesRow);
            if (comp) {
                comp.setData(itemData, i % 2 === 1);
            }
        }

        // 如果新数据比原来多（例如 LateRegister），补创建多出来的
        if (entries.length > this._itemNodes.length) {
            for (let i = this._itemNodes.length; i < entries.length; i++) {
                const itemData = entries[i];
                let row: cc.Node;

                if (this._itemPool.length > 0) {
                    row = this._itemPool.pop()!;
                } else {
                    row = cc.instantiate(this.rowPrefabNode);
                }

                row.active = true;
                content.addChild(row);
                this._itemNodes.push(row);

                row.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
                row.x = 0;

                const comp = row.getComponent(EntriesRow);
                if (comp) {
                    comp.setData(itemData, i % 2 === 1);
                }
            }
        }
        // 如果新数据比原来少，多余的节点隐藏（一般不会发生）
        else if (entries.length < this._itemNodes.length) {
            for (let i = entries.length; i < this._itemNodes.length; i++) {
                this._itemNodes[i].active = false;
            }
        }

        // 更新 content 高度
        content.height = Math.max(entries.length * this.ITEM_HEIGHT, content.parent.height);
    }
}