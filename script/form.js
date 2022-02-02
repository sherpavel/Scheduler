class Form {
    #ACTIONS = {
        CLOSE: null,
        ADD: null,
        EDIT: null,
        CANCEL_EDIT: null,
        SAVE_CHANGES: null,
    }
    #tmpEvent;
    #deleteButton;

    constructor(DOM) {
        this.DOM = DOM;

        this.inputsDiv = document.getElementById("inputs");
        this.labelInput = document.getElementById("label-input");
        this.categorySelect = document.getElementById("category-select");
        this.categoryNameInput = document.getElementById("category-input");
        this.dateInput = document.getElementById("date-input");
        this.textArea = document.getElementById("info-input");

        this.labelInput.addEventListener("input", () => this.labelInput.classList.remove("invalid"));
        this.categoryNameInput.addEventListener("change", () => this.categoryNameInput.classList.remove("invalid"));
        this.dateInput.addEventListener("change", () => this.dateInput.classList.remove("invalid"));

        this.categorySelect.addEventListener("change", () => {
            this.categorySelect.classList.remove("invalid")
            if (this.categorySelect.value === "new_category") {
                this.categorySelect.style.display = "none";
                this.categoryNameInput.style.display = "block";
                this.categoryNameInput.focus();
            }
        });
        this.textArea.addEventListener("input", () => {
            this.textArea.style.height = "auto";
            this.textArea.style.height = `${this.textArea.scrollHeight}px`;
        });

        this.buttonsDiv = this.DOM.querySelector(".buttons");
        this.leftButton = document.getElementById("left-button");
        this.rightButton = document.getElementById("right-button");

        this.#ACTIONS.CLOSE = () => {
            this.hide();
            setTimeout(() => this.clearAll(), 200);
        };
        this.#ACTIONS.ADD = () => {
            if (!this.#validInputs()) return;

            let eventObj = {
                name: this.labelInput.value,
                category: this.categorySelect.value,
                info: this.textArea.value,
                date: new Date(this.dateInput.value).getTime(),
            };
    
            if (this.categorySelect.value === "new_category") {
                eventObj.category = this.categoryNameInput.value;
                this.#catListener.forEach(l => l(this.categoryNameInput.value));
            }
            this.#entryListeners.forEach(l => l(eventObj));
            
            this.hide();
            setTimeout(() => this.clearAll(), 200);
        };
        this.#ACTIONS.EDIT = () => {
            this.#unlockInputs();
            this.#unloadListeners();

            this.leftButton.textContent = "Cancel";
            this.rightButton.textContent = "Save";
            this.leftButton.addEventListener("click", this.#ACTIONS.CANCEL_EDIT);
            this.rightButton.addEventListener("click", this.#ACTIONS.SAVE_CHANGES);
        };
        this.#ACTIONS.CANCEL_EDIT = () => {
            this.clearAll();
            this.showEdit(this.#tmpEvent);
        };
        this.#ACTIONS.SAVE_CHANGES = () => {  
            if (!this.#validInputs()) return;

            let newEvent = {
                name: this.labelInput.value,
                category: this.categorySelect.value,
                info: this.textArea.value,
                date: new Date(this.dateInput.value).getTime(),
            };
    
            if (this.categorySelect.value === "new_category") {
                newEvent.category = this.categoryNameInput.value;
                this.#catListener.forEach(l => l(this.categoryNameInput.value));
            }
            this.#tmpEvent.name = newEvent.name;
            this.#tmpEvent.category = newEvent.category;
            this.#tmpEvent.date = newEvent.date;
            this.#tmpEvent.info = newEvent.info;
            this.#editListeners.forEach(l => l(this.#tmpEvent));
            
            this.hide();
            setTimeout(() => this.clearAll(), 200);
        };

        this.clearAll();
    }

    #shake(e) {
        e.classList.add("invalid", "shake");
        setTimeout(() => {
            e.classList.remove("shake");
        }, 200);
    }
    #validInputs() {
        let valid = true;
        if (this.labelInput.value.trim() === "") {
            this.#shake(this.labelInput);
            valid = false;
        }
        if (this.categorySelect.value === "none") {
            this.#shake(this.categorySelect);
            valid = false;
        }
        if (this.categorySelect.value === "new_category" && this.categoryNameInput.value.trim() === "") {
            this.#shake(this.categoryNameInput);
            valid = false;
        }
        if (this.dateInput.value === "") {
            this.#shake(this.dateInput);
            valid = false;
        }
        return valid;
    }

    #entryListeners = [];
    #catListener = [];
    #editListeners = [];
    #deleteListeners = [];
    addEntryListener(l) {
        this.#entryListeners.push(l);
    }
    addCategoryListener(l) {
        this.#catListener.push(l);
    }
    addEditListener(l) {
        this.#editListeners.push(l);
    }
    addDeleteListener(l) {
        this.#deleteListeners.push(l);
    }

    showAdd() {
        _SetOverlay(true);
        
        this.DOM.classList.add("add");
        setTimeout(() => {
            this.DOM.classList.add("active");
        }, 10);
        this.leftButton.textContent = "Cancel";
        this.rightButton.textContent = "Add";
        this.leftButton.addEventListener("click", this.#ACTIONS.CLOSE);
        this.rightButton.addEventListener("click", this.#ACTIONS.ADD);
    }
    showEdit(e) {
        _SetOverlay(true);

        this.DOM.classList.add("edit");
        setTimeout(() => {
            this.DOM.classList.add("active");
        }, 10);

        this.#tmpEvent = e;

        this.labelInput.value = e.name;
        this.categorySelect.value = e.category;
        this.dateInput.value = new Date(e.date).toISOString().substring(0,10);
        this.textArea.value = e.info;

        if (!this.textArea.value || this.textArea.value === "") {
            this.textArea.style.display = "none";
        } else {
            this.textArea.style.height = "auto";
            this.textArea.style.height = `${this.textArea.scrollHeight}px`;
        }

        this.#lockInputs();

        let img = document.createElement("img");
        img.src = "resources/trash.png";
        img.alt = "Remove";
        this.#deleteButton = document.createElement("button");
        this.#deleteButton.id = "delete-button";
        this.#deleteButton.append(img);
        this.#deleteButton.addEventListener("click", () => {
            this.#ACTIONS.CLOSE();
            this.#deleteListeners.forEach(l => l(e));
        });
        this.buttonsDiv.append(this.#deleteButton);

        this.leftButton.textContent = "Close";
        this.rightButton.textContent = "Edit";
        this.leftButton.addEventListener("click", this.#ACTIONS.CLOSE);
        this.rightButton.addEventListener("click", this.#ACTIONS.EDIT);
    }
    hide() {
        _SetOverlay(false);
        this.DOM.classList.remove("active");
        setTimeout(() => {
            this.DOM.classList.remove("add");
            this.DOM.classList.remove("edit");
        }, 200);
    }

    #lockInputs() {
        this.labelInput.disabled = true;
        this.categorySelect.disabled = true;
        this.dateInput.disabled = true;
        this.textArea.disabled = true;
        this.labelInput.classList.add("view");
        this.categorySelect.classList.add("view");
        this.dateInput.classList.add("view");
        this.textArea.classList.add("view");
    }
    #unlockInputs() {
        this.labelInput.disabled = false;
        this.categorySelect.disabled = false;
        this.dateInput.disabled = false;
        this.textArea.disabled = false;
        this.labelInput.classList.remove("view");
        this.categorySelect.classList.remove("view");
        this.dateInput.classList.remove("view");
        this.textArea.classList.remove("view");
        this.textArea.style.display = "block";
    }
    #unloadListeners() {
        this.leftButton.removeEventListener("click", this.#ACTIONS.CLOSE);
        this.leftButton.removeEventListener("click", this.#ACTIONS.CANCEL_EDIT);
        this.rightButton.removeEventListener("click", this.#ACTIONS.ADD);
        this.rightButton.removeEventListener("click", this.#ACTIONS.EDIT);
        this.rightButton.removeEventListener("click", this.#ACTIONS.SAVE_CHANGES);
        if (this.#deleteButton) this.#deleteButton.remove();
    }
    clearAll() {
        this.labelInput.value = "";
        this.categorySelect.value = "none";
        this.categoryNameInput.value = "";
        this.dateInput.value = "";
        this.textArea.value = "";
        this.labelInput.classList.remove("invalid");
        this.categorySelect.classList.remove("invalid");
        this.dateInput.classList.remove("invalid");
        this.textArea.classList.remove("invalid");
        this.categorySelect.style.display = "block";
        this.categoryNameInput.style.display = "none";
        this.textArea.style.height = "auto";
        this.#unlockInputs();
        this.#unloadListeners();
    }
}
