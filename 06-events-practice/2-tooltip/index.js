class Tooltip {
    static instance = null;
    element = null;

    constructor() {
        if (Tooltip.instance) return Tooltip.instance;
        Tooltip.instance = this;

        this.initEventListeners();
    }

    get template() {
        return `<div class="tooltip"></div>`;
    }

    initialize() {
        let element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.element.hidden = true;
        document.body.append(this.element);
    }

    render(message) {
        if (!this.element) {
            this.initialize();
        }
        this.element.innerHTML = message;
        this.element.hidden = false;
    }

    move(x = 0, y = 0) {
        const shift = 5;
        this.element.style.left = x + shift + "px";
        this.element.style.top = y + shift + "px";
    }

    hide() {
        this.remove();
        this.element = null;
    }

    showToolTip(event) {
        if (!event.target.dataset || !event.target.dataset.tooltip) return;

        this.render(event.target.dataset.tooltip);
        event.target.addEventListener("pointermove", this.moveToolTip.bind(this));
        event.target.addEventListener("pointerout", this.hideToolTip.bind(this));
    }

    moveToolTip(event) {
        if (!event.target.dataset || !event.target.dataset.tooltip) return;

        this.move(event.clientX, event.clientY);
    }

    hideToolTip(event) {
        if (!event.target.dataset || !event.target.dataset.tooltip) return;

        this.hide();
        event.target.removeEventListener("pointermove", this.moveToolTip.bind(this));
        event.target.removeEventListener("pointerout", this.hideToolTip.bind(this));
    }

    initEventListeners() {
        document.addEventListener("pointerover", this.showToolTip.bind(this));
    }

    remove() {
        this.element?.remove();
    }

    destroy() {
        this.remove();
        document.removeEventListener("pointerover", this.showToolTip.bind(this));
        this.element = null;
    }
}

export default Tooltip;
