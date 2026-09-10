const { ccclass, property } = cc._decorator;

@ccclass
export default class PayoutStructurePopup extends cc.Component {

    @property(cc.ScrollView) scrollView: cc.ScrollView = null!;
    @property(cc.Node) headerRow: cc.Node = null!;       // header row node (HorizontalLayout)
    @property(cc.Node) rowTemplate: cc.Node = null!;     // one rank row template (hidden)
    @property(cc.Node) headerCellTemplate: cc.Node = null!;  // cell template for header
    @property(cc.Node) dataCellTemplate: cc.Node = null!;    // cell template for data

    show(data: any) {
        this.node.active = true;
        this.initPayoutStructure(data);
    }

    initPayoutStructure(data: any) {
        if (!data) return;

        const structures: any[] = data.allPayoutStructures ?? [];
        if (structures.length === 0) return;

        // Sort by minPlayers ascending (left = fewer players, right = more)
        structures.sort((a, b) => (a.minPlayers ?? 0) - (b.minPlayers ?? 0));

        // Collect all unique rank labels across all structures (e.g. "Rank 1", "Rank 2", ...)
        const rankSet = new Set<string>();
        structures.forEach(s => {
            (s.payoutRecord ?? []).forEach((r: any) => rankSet.add(r.playerRank));
        });
        const ranks = Array.from(rankSet).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, "")) || 0;
            const numB = parseInt(b.replace(/\D/g, "")) || 0;
            return numA - numB;
        });

        this.buildHeader(structures);
        this.buildRows(structures, ranks);
    }

    private buildHeader(structures: any[]) {
        if (!this.headerRow || !this.headerCellTemplate) return;

        // Remove old dynamic cells (keep first child = "Ranking/Entrants" label)
        const children = this.headerRow.children.slice();
        for (let i = 1; i < children.length; i++) {
            children[i].destroy();
        }

        structures.forEach(s => {
            const cell = cc.instantiate(this.headerCellTemplate);
            cell.active = true;
            const lbl = cell.getComponent(cc.Label) ?? cell.getChildByName("Label")?.getComponent(cc.Label);
            if (lbl) lbl.string = (s.playerRange ?? "").replace(" - ", "-").replace(" ", "");
            this.headerRow.addChild(cell);
        });
    }

    private buildRows(structures: any[], ranks: string[]) {
        if (!this.scrollView || !this.rowTemplate) return;

        const content = this.scrollView.content;

        // Remove old rows (keep rowTemplate hidden at index 0)
        const existing = content.children.slice();
        for (let i = 0; i < existing.length; i++) {
            if (existing[i] !== this.rowTemplate) existing[i].destroy();
        }

        ranks.forEach(rankLabel => {
            const row = cc.instantiate(this.rowTemplate);
            row.active = true;
            content.addChild(row);

            // First cell = rank name ("1st", "2nd", ...)
            const rankCell = row.getChildByName("rankCell") ?? row.children[0];
            if (rankCell) {
                const lbl = rankCell.getComponent(cc.Label) ?? rankCell.getChildByName("Label")?.getComponent(cc.Label);
                if (lbl) lbl.string = this.formatRank(rankLabel);
            }

            // Remove old dynamic payout cells (keep first child = rankCell)
            const rowChildren = row.children.slice();
            for (let i = 1; i < rowChildren.length; i++) rowChildren[i].destroy();

            // Add one payout cell per structure
            structures.forEach(s => {
                const record = (s.payoutRecord ?? []).find((r: any) => r.playerRank === rankLabel);
                const cell = cc.instantiate(this.dataCellTemplate);
                cell.active = true;
                const lbl = cell.getComponent(cc.Label) ?? cell.getChildByName("Label")?.getComponent(cc.Label);
                if (lbl) lbl.string = record ? `${record.playerPayout}` : "";
                row.addChild(cell);
            });
        });
    }

    // "Rank 1" → "1st", "Rank 2" → "2nd", "Rank 11-15" → "11-15"
    private formatRank(rankLabel: string): string {
        const clean = rankLabel.replace("Rank ", "").trim();
        const num = parseInt(clean);
        if (isNaN(num)) return clean;
        const suffix = ["th", "st", "nd", "rd"];
        const v = num % 100;
        return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
    }

    closeBtnClicked() {
        this.node.active = false;
    }
}
