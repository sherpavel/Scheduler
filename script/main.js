const NULL_CAT = "null_cat";
let CATEGORIES = {};
let EVENTS_LIST = [];
const COLORS = ["#4a80ff","#ff4020","#19e680","#cc1650","#ffa930","#d13434"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let form, categoryEdit;
let IS_MOBILE = false;

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

    #isOpen = false;
    constructor(c, categories, categoryEdit) {
        this.span = document.createElement("span");
        this.span.textContent = c;

        let editImg = document.createElement("img");
        let deleteImg = document.createElement("img");
        editImg.src = "resources/paint.png";
        deleteImg.src = "resources/trash.png";
        this.editDiv = document.createElement("div");
        this.editDiv.append(deleteImg, editImg);

        this.DOM = document.createElement("div");
        this.DOM.className = "category-item";
        this.DOM.style.backgroundColor = categories[c].color;
        this.DOM.append(this.span, this.editDiv);

        let expandAction = () => {
            this.expand();
            this.#expandListeners.forEach(l => l(this));
        }
        if (!IS_MOBILE) {
            this.DOM.addEventListener("mouseover", () => expandAction());
        }
        this.span.addEventListener("click", () => {
            if (this.#isOpen) this.hide();
            else expandAction();
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
        this.#isOpen = true;
        this.DOM.style.height = (this.span.clientHeight + this.editDiv.clientHeight) + "px";
    }

    #locked = false;
    setLock(lock) {
        this.#locked = lock;
    }
    hide() {
        this.#isOpen = false;
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
function displayEvents(keyedEvents, keys, dates) {
    let timelineDOM = document.getElementById("timeline");
    timelineDOM.innerHTML = "";

    if (keys.length === 0) {
        document.getElementById("timeline-wrapper").style.display = "none";
        return;
    } else {
        document.getElementById("timeline-wrapper").style.display = "block";
    }

    for(let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let date = dates[i];

        let dateText = document.createElement("span");
        dateText.textContent = key;
        let weekdayText = document.createElement("span");
        weekdayText.textContent = WEEK_DAYS[date.getUTCDay()];

        let dateDiff = (date1, date2) => {
            return Math.ceil((date2 - date1) / (1000*60*60*24));
        };
        
        let crtTime = new Date(Date.now());
        crtTime = new Date(crtTime.getFullYear(), crtTime.getMonth(), crtTime.getDate());
        let diff = dateDiff(crtTime, date);
        let timeToText = document.createElement("span");
        if (diff === 0) {
            timeToText.textContent = "Today";
            timeToText.className = "highlight";
        } else if (diff === 1) {
            timeToText.textContent = "Tmrw";
            timeToText.className = "highlight";
        } else if (diff > 0) {
            if (diff < 31) timeToText.textContent = `${diff} days`;
            else timeToText.textContent = `${Math.round(diff/31)} mo.`;
        }
        
        

        let dateDiv = document.createElement("div");
        dateDiv.className = "date-container";
        dateDiv.append(dateText, weekdayText, timeToText);

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
                categoryEdit.close();
            });

            eventsWrapper.append(eventDOM);
        });

        let dateBlock = document.createElement("div");
        dateBlock.className = "date-event-block";
        dateBlock.append(dateDiv, eventsWrapper);
        timelineDOM.append(dateBlock);

        if (dateDiff(crtTime, dates[i]) < 0 && dateDiff(crtTime, dates[i+1]) >= 0) {
            let crtBlock = document.createElement("div");
            crtBlock.id = "current";
            let hr = document.createElement("hr");
            crtBlock.append(hr);
            timelineDOM.append(crtBlock);
        } else {
            timelineDOM.append(document.createElement("hr"));
        }
        
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
    let dates = [];
    data.sort((a, b) => a.date - b.date);
    data.forEach(e => {
        let date = new Date(e.date);
        let key = MONTH_NAMES[date.getUTCMonth()] + " " + date.getUTCDate();
        if (!keyedEvents[key]) {
            keys.push(key);
            dates.push(date);
            keyedEvents[key] = [];
        }
        keyedEvents[key].push(e);
    });
    displayEvents(keyedEvents, keys, dates);
}

function _SetOverlay(state) {
    if (state) {
        document.body.classList.add("dim");
        document.getElementById("overlay").style.display = "block";
    } else {
        document.body.classList.remove("dim");
        document.getElementById("overlay").style.display = "none";
    }
}

window.addEventListener("load", () => {
    loadDataFromLocal();
    IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

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
    categoryEdit.addListener("save", (oldC, newC) => {
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

    document.getElementById("create-entry").addEventListener("click", () => {
        form.showAdd();
        categoryEdit.close();
    });

    document.body.style.height = window.innerHeight;  
    window.addEventListener("resize", () => {
        document.body.style.height = window.innerHeight;
    });
}, false);
