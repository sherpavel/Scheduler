class CategoryEdit {
    constructor(DOM, colors) {
        this.DOM = DOM;

        this.nameInput = document.getElementById("category-name");
        this.colorSelect = document.getElementById("category-color-select");
        this.selectedColor = document.getElementById("selected-color");
        this.dropdown = document.getElementById("dropdown");
        this.cancelButton = document.getElementById("cancel-button");
        this.saveButton = document.getElementById("save-button");

        colors.forEach(c => {
            let option = document.createElement("div");
            option.className = "color";
            option.style.backgroundColor = c;
            this.dropdown.append(option);

            option.addEventListener("click", () => {
                this.selectedColor.className = c;
                this.selectedColor.style.backgroundColor = c;
                this.closeDropdown();
            });
        });
        this.nameInput.addEventListener("input", () => this.nameInput.classList.remove("invalid"));
        this.selectedColor.addEventListener("click", () => this.openDropdown());
        this.cancelButton.addEventListener("click", () => this.close());
        this.saveButton.addEventListener("click", () => this.save());

        this.closeDropdown();
    }

    #saveListeners = [];
    addSaveListener(l) {
        this.#saveListeners.push(l);
    }

    #tmpC;
    #catBlock;
    show(c, categories, catBlock) {
        this.#tmpC = c;
        this.#catBlock = catBlock;
        this.#catBlock.setLock(true);

        let r = getComputedStyle(document.getElementById("categories-list")).getPropertyValue("border-radius")

        this.DOM.style.display = "block";
        let rect = catBlock.DOM.getBoundingClientRect();
        this.DOM.style.left = rect.right + "px";
        this.DOM.style.top = rect.top + "px";

        this.nameInput.value = c;
        this.selectedColor.className = categories[c].color;
        this.selectedColor.style.backgroundColor = categories[c].color;

        document.getElementById("timeline-wrapper").style.opacity = "0.2";
    }
    close() {
        this.DOM.style.display = "none";
        this.nameInput.classList.remove("invalid");
        document.getElementById("timeline-wrapper").style.opacity = "1";
        this.#catBlock.setLock(false);
        this.#catBlock.hide();
    }
    save() {
        if (this.nameInput.value.trim() === "") {
            this.#shake(this.nameInput);
            return;
        }

        let c = {
            key: this.nameInput.value,
            color: this.selectedColor.className,
        };
        this.#saveListeners.forEach(l => l(this.#tmpC, c));
        this.close();
        this.#catBlock.setLock(false);
        this.#catBlock.hide();
    }

    openDropdown() {
        this.dropdown.style.display = "flex";
    }
    closeDropdown() {
        this.dropdown.style.display = "none";
    }

    #shake(e) {
        e.classList.add("invalid", "shake");
        setTimeout(() => {
            e.classList.remove("shake");
        }, 200);
    }
}