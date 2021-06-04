import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element = null;
    subElements = {};
    components = {};

    constructor() {
    }

    get template() {
        return `
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Панель управления</h2>
                    <div data-element="rangePicker">
                    </div>
                </div>
                <div class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders">
                    </div>
                    <div data-element="salesChart" class="dashboard__chart_sales">
                    </div>
                    <div data-element="customersChart" class="dashboard__chart_customers">
                    </div>
                </div>
                <h3 class="block-title">Лидеры продаж</h3>
                <div data-element="sortableTable">
                </div>
            </div>
        `;
    }

    initComponents() {
        const from = new Date();
        from.setMonth(from.getMonth() - 1);
        const to = new Date();
        this.components.rangePicker = new RangePicker({from, to});

        this.components.ordersChart = new ColumnChart({
            label: "Заказы",
            link: "/sales",
            url: "api/dashboard/orders?",
            range: {
                from: from,
                to: to,
            }
        });

        this.components.salesChart = new ColumnChart({
            label: "Продажи",
            url: "api/dashboard/sales?",
            formatHeading: data => `$${data}`,
            range: {
                from: from,
                to: to,
            }
        });

        this.components.customersChart = new ColumnChart({
            label: "Клиенты",
            url: "api/dashboard/customers?",
            range: {
                from: from,
                to: to,
            }
        });

        this.components.sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
            isSortLocally: true,
            start: 0,
            step: 30
        });
    }

    async updateComponent(from, to) {
        this.components.ordersChart.update(from, to)
        this.components.salesChart.update(from, to)
        this.components.customersChart.update(from, to)

        if (this.components.sortableTable) {
            this.components.sortableTable.destroy();
            this.components.sortableTable = null;
        }
        this.components.sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
            isSortLocally: true,
            start: 0,
            step: 30
        });
        this.subElements.sortableTable.append(this.components.sortableTable.element);
    }

    async render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
        
        this.initComponents();
        
        this.subElements.rangePicker.append(this.components.rangePicker.element);
        this.subElements.ordersChart.append(this.components.ordersChart.element);
        this.subElements.salesChart.append(this.components.salesChart.element);
        this.subElements.customersChart.append(this.components.customersChart.element);
        this.subElements.sortableTable.append(this.components.sortableTable.element);

        this.initEventListeners();

        return this.element;
    }

    rangePicker_DateSelect = (event) => {
        const {from, to} = event.detail;
        this.updateComponent(from, to);
    }

    initEventListeners() {
       const {rangePicker} = this.components;
       rangePicker.element.addEventListener("date-select", this.rangePicker_DateSelect);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll("[data-element]");

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    remove() {
        this.element?.remove();
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}
