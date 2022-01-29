const NULL_CAT = "null_cat";
let CATEGORIES = {};
let EVENTS_LIST = [];
const COLORS = ["#4a80ff","#ff4020","#19e680","#cc1650","#ffa930","#d13434"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let form, categoryEdit;

const STORAGE_KEYS = {
    EVENTS_LIST: "events_list",
    CATEGORIES: "categories",
}
function saveDataToLocal() {
    localStorage.setItem(STORAGE_KEYS.EVENTS_LIST, JSON.stringify(EVENTS_LIST));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(CATEGORIES));
}
function loadDataFromLocal() {
    EVENTS_LIST = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS_LIST)) || [];
    CATEGORIES = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || {};
}

class CategoryBlock {
    #expandListeners = [];

    constructor(c, categories, categoryEdit) {
        this.span = document.createElement("span");
        this.span.textContent = c;

        let editImg = document.createElement("img");
        let deleteImg = document.createElement("img");
        editImg.src = "resources/paint.png";
        deleteImg.src = "resources/trash.png";
        this.editDiv = document.createElement("div");
        this.editDiv.append(editImg, deleteImg);

        this.DOM = document.createElement("div");
        this.DOM.className = "category-item";
        this.DOM.style.backgroundColor = categories[c].color;
        this.DOM.append(this.span, this.editDiv);

        this.DOM.addEventListener("mouseover", () => {
            this.expand();
            this.#expandListeners.forEach(l => l(this));
        });
        editImg.addEventListener("click", () => {
            categoryEdit.show(c, CATEGORIES, this);
        });
        deleteImg.addEventListener("click", () => {
            removeCategory(c, categories, EVENTS_LIST);
            displayCategories(CATEGORIES);
            populateCategorySelect(CATEGORIES);
            updateEvents(EVENTS_LIST);
            saveDataToLocal();
        });
    }
    show() {
        this.DOM.style.height = this.span.clientHeight + "px";
    }
    addExpandListener(l) {
        this.#expandListeners.push(l);
    }

    expand() {
        this.DOM.style.height = (this.span.clientHeight + this.editDiv.clientHeight) + "px";
    }

    #locked = false;
    setLock(lock) {
        this.#locked = lock;
    }
    hide() {
        if (this.#locked) return;
        this.show();
    }
}

function displayCategories(categories) {
    let list = document.getElementById("categories-list");
    list.innerHTML = "";
    let catList = [];
    Object.keys(categories).forEach(c => {
        let cat = new CategoryBlock(c, CATEGORIES, categoryEdit);
        catList.push(cat);
        list.append(cat.DOM);
        cat.show();
        cat.addExpandListener(ctg => {
            catList.forEach(cb => {
                if (ctg === cb) return;
                cb.setLock(false);
                cb.hide();
            });
        });
    });
    list.addEventListener("mouseleave", () => {
        catList.forEach(cb => cb.hide());
    });
}
function populateCategorySelect(categories) {
    let select = document.getElementById("category-select");
    select.innerHTML = `<option value="none" selected disabled hidden>Choose category</option><option value="new_category">Create new...</option><option value="${NULL_CAT}">None</option>`;

    Object.keys(categories).forEach(key => {
        let option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        select.append(option);
    });
}
function displayEvents(keyedEvents, keys, weekdays) {
    let timelineDOM = document.getElementById("timeline");
    timelineDOM.innerHTML = "";

    for(let i = 0; i < keys.length; i++) {
        let key = keys[i];

        let dateText = document.createElement("span");
        dateText.textContent = key;
        let weekdayText = document.createElement("span");
        weekdayText.textContent = weekdays[i];
        let dateDiv = document.createElement("div");
        dateDiv.className = "date-container";
        dateDiv.append(dateText, weekdayText);

        let eventsWrapper = document.createElement("div");
        eventsWrapper.className = "events-container";

        keyedEvents[key].forEach(e => {
            let h2 = document.createElement("h2");
            h2.textContent = e.name;
            let span = document.createElement("span");
            span.textContent = e.category;
            h2.append(span);
            let p = document.createElement("p");
            p.textContent = e.info;

            let eventDOM = document.createElement("div");
            eventDOM.className = "event"
            eventDOM.append(h2, p);
            if (e.category === NULL_CAT) {
                eventDOM.style.backgroundColor = "#aaa";
                span.textContent = "";
            } else {
                eventDOM.style.backgroundColor = CATEGORIES[e.category].color;
            }

            eventDOM.addEventListener("click", () => {
                form.showEdit(e);
            });

            eventsWrapper.append(eventDOM);
        });

        let dateBlock = document.createElement("div");
        dateBlock.className = "date-event-block";
        dateBlock.append(dateDiv, eventsWrapper);

        timelineDOM.append(dateBlock, document.createElement("hr"));
    };

    if (timelineDOM.lastChild) timelineDOM.lastChild.remove();
}

function removeCategory(c, categories, data) {
    delete categories[c];
    data.forEach(e => {
        if (e.category === c) e.category = NULL_CAT;
    });
}
function removeEvent(e, data) {
    data.splice(data.indexOf(e), 1);
}
function updateEvents(data) {
    let keyedEvents = {};
    let keys = [];
    let weekdays = [];
    data.sort((a, b) => a.date - b.date);
    data.forEach(e => {
        let date = new Date(e.date);
        let key = MONTH_NAMES[date.getUTCMonth()] + " " + date.getUTCDate();
        if (!keyedEvents[key]) {
            keys.push(key);
            weekdays.push(WEEK_DAYS[date.getUTCDay()]);
            keyedEvents[key] = [];
        }
        keyedEvents[key].push(e);
    });
    displayEvents(keyedEvents, keys, weekdays);
}

window.addEventListener("load", () => {
    loadDataFromLocal();

    form = new Form(document.getElementById("form"));
    form.addEntryListener(e => {
        EVENTS_LIST.push(e);
        displayCategories(CATEGORIES);
        populateCategorySelect(CATEGORIES);
        updateEvents(EVENTS_LIST);
        saveDataToLocal();
    });
    form.addCategoryListener(c => {
        if (CATEGORIES[c] || c === NULL_CAT) return;
        CATEGORIES[c] = {
            color: COLORS[Math.floor(COLORS.length*Math.random())]
        };
        saveDataToLocal();
    });
    form.addEditListener(e => {
        displayCategories(CATEGORIES);
        populateCategorySelect(CATEGORIES);
        updateEvents(EVENTS_LIST);
        saveDataToLocal();
    });
    form.addDeleteListener(e => {
        EVENTS_LIST.splice(EVENTS_LIST.indexOf(e), 1);
        updateEvents(EVENTS_LIST);
        saveDataToLocal();
    });

    categoryEdit = new CategoryEdit(document.getElementById("category-edit"), COLORS);
    categoryEdit.addSaveListener((oldC, newC) => {
        if (oldC == newC.key) {
            CATEGORIES[newC.key].color = newC.color;
        } else {
            removeCategory(oldC, CATEGORIES);
            CATEGORIES[newC.key] = {
                color: newC.color
            };
        }
        displayCategories(CATEGORIES);
        populateCategorySelect(CATEGORIES);
        updateEvents(EVENTS_LIST);
        saveDataToLocal();
    });

    displayCategories(CATEGORIES);
    populateCategorySelect(CATEGORIES);
    updateEvents(EVENTS_LIST);

    let createEventBtn = document.getElementById("create-entry");
    createEventBtn.addEventListener("click", () => {
        form.showAdd();
    });
}, false);
