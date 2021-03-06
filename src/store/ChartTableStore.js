import { observable, action, computed, reaction } from 'mobx';
import moment from 'moment';
import Dialog from '../components/Dialog.jsx';
import DialogStore from './DialogStore';

export default class ChartTableStore {
    constructor(mainStore) {
        this.mainStore = mainStore;
        this.dialog = new DialogStore(mainStore);
        this.Dialog = this.dialog.connect(Dialog);
        reaction(() => this.dialog.open, this.loadTableData);
    }

    get context() { return this.mainStore.chart.context; }
    get stx() { return this.context.stx; }
    get state() { return this.mainStore.state; }
    get chartTypeStore() { return this.mainStore.chartType; }

    @computed get open() { return this.dialog.open; }
    @action.bound setOpen(value) {
        return this.dialog.setOpen(value);
    }

    @observable tableData = [];
    @observable isTick;

    @computed get symbol() {
        return this.mainStore.chart.currentActiveSymbol ? this.mainStore.chart.currentActiveSymbol : {};
    }

    @computed get decimalPlaces() {
        return this.mainStore.chart.currentActiveSymbol.decimal_places;
    }

    @action.bound loadTableData() {
        if (this.open) {
            this.stx.masterData.forEach(row => this.updateTableData(row));
            this.mainStore.chart.feed.onMasterDataUpdate(this.updateTableData);
        } else {
            if (this.mainStore.chart.feed) this.mainStore.chart.feed.offMasterDataUpdate(this.updateTableData);
            this.tableData =  [];
            if (this.chartTypeStore.onChartTypeChanged && this.state.prevChartType) {
                this.chartTypeStore.onChartTypeChanged(this.state.prevChartType);
            }
        }
    }

    @action.bound updateTableData({ DT, Open, High, Low, Close }) {
        this.isTick = this.mainStore.timeperiod.timeUnit === 'tick';
        const dateTime = moment(DT.getTime()).format('DD MMM YYYY HH:mm:ss');
        const lastTick =  this.tableData.length > 0 ? this.tableData[0] : {};
        const change = Close - lastTick.Close || 0;
        let status = '';
        if (Math.sign(change) !== 0) status = Math.sign(change) === 1 ? 'up' :  'down';

        if (this.isTick && Close) {
            this.tableData.unshift({
                Date: dateTime,
                Close: `${Close.toFixed(this.decimalPlaces)}`,
                Change: `${Math.abs(change).toFixed(this.decimalPlaces)}`,
                Status: status,
            });
        } else if (!this.isTick && Open && High && Low && Close) {
            if (lastTick.Date === dateTime) {
                const firstItemChange = Close - this.tableData[1].Close;
                let firstItemStatus = '';
                if (Math.sign(firstItemChange) !== 0) firstItemStatus = (Math.sign(firstItemChange) === 1 ? 'up' : 'down');

                lastTick.High = `${High.toFixed(this.decimalPlaces)}`;
                lastTick.Low = `${Low.toFixed(this.decimalPlaces)}`;
                lastTick.Close = `${Close.toFixed(this.decimalPlaces)}`;
                lastTick.Change = `${Math.abs(firstItemChange).toFixed(this.decimalPlaces)}`;
                lastTick.Status = firstItemStatus;
            } else {
                this.tableData.unshift(
                    {
                        Date: dateTime,
                        Open: `${Open.toFixed(this.decimalPlaces)}`,
                        High: `${High.toFixed(this.decimalPlaces)}`,
                        Low: `${Low.toFixed(this.decimalPlaces)}`,
                        Close: `${Close.toFixed(this.decimalPlaces)}`,
                        Change: `${Math.abs(change).toFixed(this.decimalPlaces)}`,
                        Status: status,
                    },
                );
            }
        }
        this.tableData = this.tableData.slice(0); // force array update
    }
}
