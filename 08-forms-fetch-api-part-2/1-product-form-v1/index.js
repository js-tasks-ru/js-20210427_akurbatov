import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    element = null;
    subElements = {};

    constructor (productId) {
        this.productId = productId;
        this.urlCategories = "api/rest/categories";
        this.urlProduct = "api/rest/products";
        this.categories = [];
        this.product = {};
    }

    templateItemImage(image) {
        return `
            <li class="products-edit__imagelist-item sortable-list__item" style="">
                <input type="hidden" name="url" value="${image.url}">
                <input type="hidden" name="source" value="${image.source}">
                <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                    <span>${image.source}</span>
                </span>
                <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
            </li>
        `;
    }

    get template() {
        return `
            <div class="product-form">
                <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                    <fieldset>
                        <label class="form-label">Название товара</label>
                        <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
                    </fieldset>
                </div>
                <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                        <ul class="sortable-list">
                            <!-- Список фото -->
                        </ul>
                    </div>
                    <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                    <input name="fileInput" data-element="fileInput" type="file" style="display:none;" />
                </div>
                <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    <select class="form-control" name="subcategory" id="subcategory">
                        <!-- Список категорий -->
                    </select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                        <label class="form-label">Цена ($)</label>
                        <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
                    </fieldset>
                    <fieldset>
                        <label class="form-label">Скидка ($)</label>
                        <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
                    </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status" id="status">
                        <option value="1">Активен</option>
                        <option value="0">Неактивен</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                        Сохранить товар
                    </button>
                </div>
                </form>
            </div>
        `;
    }

    async getProduct(id) {
        let url = new URL(this.urlProduct, BACKEND_URL);
        url.searchParams.append("id", id);
        return await fetchJson(url);
    }

    async getCategories() {
        let url = new URL(this.urlCategories, BACKEND_URL);
        url.searchParams.append("_sort", "weight");
        url.searchParams.append("_refs", "subcategory");
        return await fetchJson(url);
    }

    async render () {
        this.categories = await this.getCategories();
        this.product = await this.getProduct(this.productId);
        if (this.product.length)
            this.product = this.product[0];
        else
            this.product = {};

        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
        
        this.categories.forEach(category => {
            category.subcategories.forEach(subcategory => {
                const isSelected = this.product.subcategory === subcategory.id;
                let option = new Option(`${category.title} > ${subcategory.title}`, subcategory.id, isSelected, isSelected);
                this.subElements.productForm.elements.subcategory.append(option);
            });
        });

        const listImages = this.subElements.productForm.querySelector(".sortable-list");
        listImages.innerHTML = "";
        this.product.images.forEach(image => {
            listImages.innerHTML += this.templateItemImage(image);
        });
        
        this.subElements.productForm.elements.title.value = this.product.title || "";
        this.subElements.productForm.elements.description.value = this.product.description || "";
        this.subElements.productForm.elements.price.value = this.product.price || "";
        this.subElements.productForm.elements.discount.value = this.product.discount || "";
        this.subElements.productForm.elements.quantity.value = this.product.quantity || "";
        this.subElements.productForm.elements.status.value = this.product.status;

        this.initEventListeners();
        return this.element;
    }

    initEventListeners () {
        this.subElements.productForm.elements.uploadImage.addEventListener("click", this.uploadImageClick);
        this.subElements.productForm.elements.fileInput.addEventListener("change", this.fileInputChange);
        this.subElements.productForm.elements.title.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.description.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.subcategory.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.price.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.discount.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.quantity.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.status.addEventListener("input", this.inputChange);
        this.subElements.productForm.elements.save.addEventListener("click", this.btnSaveClick);
    }

    uploadImageClick = () => {
        this.subElements.fileInput.click();
    }

    fileInputChange = async () => {
        this.subElements.uploadImage.classList.add("is-loading");
        this.subElements.uploadImage.disabled = true;
        const file = this.subElements.fileInput.files[0];
        const fileSend = await this.sendFile(file);
        if (fileSend) {
            this.product.images.push(fileSend);
            const listImages = this.subElements.productForm.querySelector(".sortable-list");
            listImages.innerHTML += this.templateItemImage(fileSend);
        }
        this.subElements.uploadImage.classList.remove("is-loading");
        this.subElements.uploadImage.disabled = false;
    }

    async sendFile(file) {
        let formData = new FormData();
        formData.append("image", file);
        
        let url = new URL("3/image", "https://api.imgur.com");
        let response;
        try {
            response = await fetchJson(url, {
                method: "POST",
                headers: {
                    'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                },
                body: formData
            });
        }
        catch {}
        return response !== undefined ? {source: file.name, url: response.data.link} : null;
    }

    inputChange = (event) => {
        const name = event.target.name;
        const value = escapeHtml(event.target.value);
        this.product[name] = value;
    }

    btnSaveClick = async event => {
        event.preventDefault();

        await this.save();
    }

    save = async () => {
        let url = new URL(this.urlProduct, BACKEND_URL);
        const method = this.productId ? "PATCH" : "PUT";
        const result = {};
        try {        
            this.product = await fetchJson(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.product)
            });
            result.status = "ok";
        }
        catch {
            result.status = "error";
        }
        this.element.dispatchEvent(new CustomEvent("product-updated", {
            detail: result, 
            bubbles: true
        }));
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
