class Caeruleum {

    static #NAV_COUNTER = 0;

    static createNavbar() {
        let nav = document.createElement("nav");
        nav.className = "caeruleum-nav";
        nav.append(document.createElement("ul"));
        return nav;
    }

    // static createLink(name, URL, navbar) {
    //     this.#validateNav(navbar);
    //     let link = document.createElement("a");
    //     link.textContent = name;
    //     link.href = URL;
    //     this.#navWrapper(link, navbar);
    // }
    static createPage(name, navbar, main=false) {
        this.#validateNav(navbar);
        let span = document.createElement("span");
        span.textContent = name;
        this.#navWrapper(span, navbar, this.#NAV_COUNTER);

        let page = document.createElement("div");
        page.className = "caeruleum-page";
        if (main) page.classList.add("open");

        return page;
    }
    static attachPage(DOMElement, name, navbar) {
        this.#validateNav(navbar);
        let span = document.createElement("span");
        span.textContent = name;
        this.#navWrapper(span, navbar, this.#NAV_COUNTER);

        let page = DOMElement;
        DOMElement.remove();
        return page;
    }
    static #navWrapper(domElement, navbar, counter) {
        let li = document.createElement("li");
        li.append(domElement);
        navbar.firstChild.append(li);
    }
    static #validateNav(navbar) {
        if (!navbar.classList.contains("caeruleum-nav")) {
            console.error("Incorrent navbar format");
            return;
        }
    }


    static #SECTION_COUNTER = 0;
    /**
     * Creates an instance of the section element according to Caeruleum CSS layout.
     * @param {string} title Section title.
     * @param {string} text Section text.
     */
    static createSection(title, text) {
        let input = document.createElement("input");
        input.id = "section" + this.#SECTION_COUNTER;
        input.type = "checkbox";

        let span = document.createElement("span");
        span.textContent = title;
        let label = document.createElement("label");
        label.htmlFor = "section" + this.#SECTION_COUNTER;
        label.append(span);

        this.#SECTION_COUNTER++;

        let p = document.createElement("p");
        p.textContent = text;
        let divInner = document.createElement("div");
        divInner.append(p);
        let divOutter = document.createElement("div");
        divOutter.append(divInner);

        let section = document.createElement("section");
        section.className = "caeruleum-section";
        section.append(input);
        section.append(label);
        section.append(divOutter);

        return section;
    }

    /**
     * Commonly used input validation function.
     */
    static VALIDATION_FUNCTIONS = {
        alphabetic: this.#lettersValidation,
        numeric: this.#numbersValidation,
        alphanumeric: this.#alphanumbericValidation
    };
    static #lettersValidation(text) {
        return /^[a-zA-Z]+$/.test(text);
    }
    static #numbersValidation(text) {
        return /^[0-9]+$/.test(text);
    }
    static #alphanumbericValidation(text) {
        return /^[a-zA-Z0-9]+$/.test(text);
    }
    /**
     * Validation is used to validate the input string
     * @callback inputValidation
     * @param {string} input - Raw input string.
     * @returns {Boolean} - input validation.
     */
    /**
     * 
     * @param {string} id - DOM id
     * @param {inputValidation} validation - Input string validation function
     */
    static input(id, validation) {
        let domInput = document.getElementById(id);

        domInput.addEventListener("input", e => {
            domInput.classList.remove("valid");
            domInput.classList.remove("invalid");
            if (domInput.value) {
                if (validation(domInput.value)) {
                    domInput.classList.add("valid");
                } else {
                    domInput.classList.add("invalid");
                }
            }
        });

        domInput.addEventListener("keypress", e => {
            if (!validation(e.key)) {
                domInput.classList.add("shake");
                setTimeout(() => {
                    domInput.classList.remove("shake");
                }, 200);
            }
        });
    }
}
