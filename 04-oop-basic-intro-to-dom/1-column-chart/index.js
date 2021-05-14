export default class ColumnChart {
    element
    params
    chartHeight = 50

    constructor({
        data = [],
        label = "",
        link = "",
        value = 0,
        formatHeading = data => `${data}`
    } = {}) {
        this.params = { 
            data: data, 
            label: label, 
            link: link, 
            value: value, 
            formatHeading: formatHeading
        };
        this.render();
        this.update(data);
    }
    
    render() {
        this.element = document.createElement('div');
        this.element.innerHTML = `
            <div class="column-chart ${!this.params.data.length ? `column-chart_loading` : ``}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.params.label}
                    ${this.params.link ? `<a href="${this.params.link}" class="column-chart__link">View all</a>` : ``}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.params.formatHeading(this.params.value.toLocaleString())}</div>
                    <div data-element="body" class="column-chart__chart">
                    </div>
                </div>
            </div>
        `;
        this.element = this.element.firstElementChild;
    }
    
    update(data) {
        let ColumnsHTML = "";
        for (let prop of this.getColumnProps(data)) {
            ColumnsHTML +=`<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`;
        }
        this.element.querySelector(".column-chart__chart").innerHTML = ColumnsHTML;
    }

    remove () {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;
      
        return data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            };
        });
      }
}
