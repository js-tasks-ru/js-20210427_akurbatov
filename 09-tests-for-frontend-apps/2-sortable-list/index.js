export default class SortableList {
    element = null;
    shiftX = 0;
    shiftY = 0;
    itemDragging = null;
    placeholder = null;
    shiftDown = 3;    

    constructor({
        items = []
    }) {
        this.items = items;

        this.render();
        this.initEventListeners();
    }

    render() {
        this.element = document.createElement("ul");
        this.element.classList.add("sortable-list");
        this.items.forEach(item => {
            item.classList.add("sortable-list__item");
            this.element.append(item);
        });
    }

    pointerDown = (event) => {
        if (!event.target.hasAttribute("data-grab-handle") && !event.target.hasAttribute("data-delete-handle")) return;
        event.preventDefault();

        if (event.target.hasAttribute("data-delete-handle")) {
            event.target.closest(".sortable-list__item").remove();
            
            return;
        }

        this.itemDragging = event.target.closest(".sortable-list__item");

        const {width, height, top, left} = this.itemDragging.getBoundingClientRect();

        this.placeholder = document.createElement("div");
        this.placeholder.classList.add("sortable-list__placeholder");
        this.placeholder.style.width = width + "px";
        this.placeholder.style.height = height + "px";

        this.itemDragging.style.width = width + "px";
        this.itemDragging.style.height = height + "px";
        this.itemDragging.classList.add("sortable-list__item_dragging");
        this.itemDragging.style.top = top + this.shiftDown + "px";
        this.itemDragging.before(this.placeholder);

        this.shiftX = event.clientX - left;
        this.shiftY = event.clientY - top - this.shiftDown;

        document.addEventListener("pointermove", this.pointerMove);
        document.addEventListener("pointerup", this.pointerUp);
    }

    pointerMove = (event) => {
        event.preventDefault();

        let newLeft = event.clientX - this.shiftX;
        let newTop = event.clientY - this.shiftY;
        this.itemDragging.style.left = newLeft + "px";
        this.itemDragging.style.top = newTop + "px";

        if (this.element.firstElementChild.getBoundingClientRect().top > newTop) {
            this.element.firstElementChild.before(this.placeholder);
        }
        else {
            if (this.element.lastElementChild.getBoundingClientRect().top < newTop) {
                this.element.lastElementChild.after(this.placeholder);
            }
            else {
                for (let i = 1; i < this.element.children.length - 1; i++) {
                    const item = this.element.children[i];
                    const {top , bottom} = item.getBoundingClientRect();
                    if (item !== this.itemDragging && top < newTop && newTop < bottom) {
                        if (newTop < top + this.shiftDown) {
                            item.before(this.placeholder);
                            break;
                        }
                        this.element.children[i + 1].before(this.placeholder);
                        break;
                    }
                }
            }
        }
    }

    pointerUp = () => {
        document.removeEventListener("pointermove", this.pointerMove);
        document.removeEventListener("pointerup", this.pointerUp);

        this.placeholder.replaceWith(this.itemDragging);
        this.placeholder = null;
        this.itemDragging.classList.remove("sortable-list__item_dragging");
        this.itemDragging.style.width = "";
        this.itemDragging.style.height = "";
        this.itemDragging.style.top = "";
        this.itemDragging.style.left = "";
        this.itemDragging = null;
    }

    initEventListeners() {
        this.element.addEventListener("pointerdown", this.pointerDown);
        this.element.ondragstart = () => false;
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
