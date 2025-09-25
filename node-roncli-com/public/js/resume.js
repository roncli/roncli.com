//  ####
//  #   #
//  #   #   ###    ###   #   #  ## #    ###
//  ####   #   #  #      #   #  # # #  #   #
//  # #    #####   ###   #   #  # # #  #####
//  #  #   #          #  #  ##  # # #  #
//  #   #   ###   ####    ## #  #   #   ###
/**
 * A class that handles the résumé page.
 */
class Resume {
    //                          #          ####                    #  #           #
    //                          #          #                       ## #           #
    //  ##   ###    ##    ###  ###    ##   ###   ###    ##   # #   ## #   ##    ###   ##
    // #     #  #  # ##  #  #   #    # ##  #     #  #  #  #  ####  # ##  #  #  #  #  # ##
    // #     #     ##    # ##   #    ##    #     #     #  #  #  #  # ##  #  #  #  #  ##
    //  ##   #      ##    # #    ##   ##   #     #      ##   #  #  #  #   ##    ###   ##
    /**
     * Creates the JSON elements from the object.
     * @param {(string | number)[]} position The position of the node to create.
     * @returns {Promise} A promise that resolves when the JSON elements have been created.
     */
    static async createFromNode(position) {
        // Get the object to create.
        /** @type {any} */
        let obj = Resume.json;

        for (const key of position) {
            obj = obj[key];
        }

        // Create the elements.
        if (obj instanceof Array) {
            obj.forEach((val, index) => {
                const el = document.createElement("div");
                el.classList.add("json-node");
                el.id = `json${position.map((p) => `-${p}`).join("")}-${index}`;
                el.innerHTML = Resume.getHTML(index, obj[index], index !== obj.length - 1);
                el.style.whiteSpace = "nowrap";
                Resume.elements.push(el);
            });
        } else {
            const keys = Object.keys(obj).filter((key) => !key.startsWith("_"));
            for (const key of keys) {
                const el = document.createElement("div");
                el.classList.add("json-node");
                el.id = `json${position.map((p) => `-${p}`).join("")}-${key}`;
                el.innerHTML = Resume.getHTML(key, obj[key], key !== keys[keys.length - 1]);
                el.style.whiteSpace = "nowrap";
                Resume.elements.push(el);
            }
        }

        // Calculate the correct scale to use.
        const jsonRoot = document.getElementById("json-root");

        let totalHeight = 0;

        for (const el of Resume.elements) {
            jsonRoot.appendChild(el);

            totalHeight += el.clientHeight;
        }

        const maxHeight = jsonRoot.clientHeight - 102;

        let scale = maxHeight / totalHeight,
            done = false;

        while (!done) {
            let height = 0;

            for (const el of Resume.elements) {
                el.style.whiteSpace = "inherit";
                el.style.width = `${(jsonRoot.clientWidth - 35) / scale}px`;

                height += el.clientHeight;
            }

            if (height * scale <= maxHeight + 1) {
                done = true;
            } else {
                totalHeight += 864;
                scale = maxHeight / totalHeight;
            }
        }

        // Calculate the best width to use.
        for (const el of Resume.elements) {
            el.style.whiteSpace = "inherit";
            el.style.width = `${(jsonRoot.clientWidth - 35) / scale}px`;
            el.style.transform = `scale(${scale})`;
            el.style.opacity = "0";
        }

        let width = (jsonRoot.clientWidth - 35) / scale;

        for (let step = 1024; step >= 1; step /= 2) {
            let height = 0;

            while (height * scale <= maxHeight + 1 && width > 0) {
                height = 0;

                width -= step / scale;

                for (const el of Resume.elements) {
                    el.style.width = `${width}px`;
                    height += el.clientHeight;
                }
            }

            if (step === 1 && width < 0) {
                for (const el of Resume.elements) {
                    el.style.width = "";
                }
            } else {
                width += step / scale;
                for (const el of Resume.elements) {
                    el.style.width = `${width}px`;

                    if (el.scrollWidth > width + 1) {
                        el.style.width = "";
                    }
                }
            }
        }

        // Position the objects so that the overall object is centered.
        let maxWidth = 0;

        for (const el of Resume.elements) {
            maxWidth = Math.max(maxWidth, el.clientWidth);
        }

        let top = 57;

        for (const el of Resume.elements) {
            el.style.left = `${35 + (jsonRoot.clientWidth - 35) / 2 - maxWidth * scale / 2}px`;
            el.style.top = `${top}px`;
            el.style.width = `${maxWidth}px`;

            top += el.clientHeight * scale;
        }

        // Display maps.
        /** @type {NodeListOf<HTMLDivElement>} */
        const maps = document.querySelectorAll("#json-root div.map");

        maps.forEach((el) => {
            const overlay = document.createElement("div"),
                rect = el.getBoundingClientRect();

            overlay.style.position = "absolute";
            overlay.style.left = `${rect.x}px`;
            overlay.style.top = `${rect.y}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.opacity = "0";

            jsonRoot.appendChild(overlay);
            Resume.elements.push(overlay);

            const map = new Resume.ol.Map({
                target: overlay,
                layers: [
                    new Resume.ol.layer.Tile({
                        source: new Resume.ol.source.OSM()
                    })
                ],
                controls: [],
                view: new Resume.ol.View({
                    center: Resume.ol.proj.fromLonLat([+el.dataset.long, +el.dataset.lat]),
                    constrainOnlyCenter: true,
                    enableRotation: false,
                    extent: Resume.ol.proj.transformExtent([+el.dataset.long, +el.dataset.lat, +el.dataset.long, +el.dataset.lat], "EPSG:4326", "EPSG:3857"),
                    zoom: 13
                })
            });

            const markers = new Resume.ol.layer.Vector({
                source: new Resume.ol.source.Vector(),
                style: new Resume.ol.style.Style({
                    image: new Resume.ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "https://openlayers.org/en/latest/examples/data/icon.png"
                    })
                })
            });
            map.addLayer(markers);

            const marker = new Resume.ol.Feature(new Resume.ol.geom.Point(Resume.ol.proj.fromLonLat([+el.dataset.long, +el.dataset.lat])));
            markers.getSource().addFeature(marker);
        });

        await Resume.sleep(1);

        // Fade objects in.
        for (const el of Resume.elements) {
            if (!Resume.isIOS) {
                el.style.transition = "all 0.5s ease-in-out";
            }
            el.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
            el.style.opacity = "1";
        }

        // Setup click events on the object/array links.
        /** @type {NodeListOf<HTMLAnchorElement>} */
        const els = document.querySelectorAll("#json-root a.key");

        els.forEach((el) => {
            el.addEventListener("click", (ev) => {
                ev.preventDefault();

                Resume.drillDown(el.dataset.key);

                return false;
            });
        });
    }

    //    #         #    ##    ##    ###
    //    #               #     #    #  #
    //  ###  ###   ##     #     #    #  #   ##   #  #  ###
    // #  #  #  #   #     #     #    #  #  #  #  #  #  #  #
    // #  #  #      #     #     #    #  #  #  #  ####  #  #
    //  ###  #     ###   ###   ###   ###    ##   ####  #  #
    /**
     * Drills down into an object's key.
     * @param {string} key The key to drill down into.
     * @returns {Promise} A promise that resolves when the key has been drilled down into.
     */
    static async drillDown(key) {
        // Disable click events.
        /** @type {NodeListOf<HTMLAnchorElement>} */
        const els = document.querySelectorAll("#json-root a");

        els.forEach((el) => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener("click", (ev) => {
                ev.preventDefault();
                return false;
            });
        });

        // Fade out elements that won't remain in the scene.
        const id = `json${Resume.currentRoot.map((p) => `-${p}`).join("")}-${key}`;

        /** @type {HTMLDivElement} */
        let keyEl;

        /** @type {HTMLDivElement} */
        let frontBrace;

        /** @type {HTMLDivElement} */
        let backBrace;

        /** @type {string} */
        let transform;

        for (const el of Resume.elements) {
            if (el.id === id) {
                keyEl = el.querySelector(".key");
                frontBrace = el.querySelector(".front-brace, .front-bracket");
                backBrace = el.querySelector(".back-brace, .back-bracket");

                /** @type {HTMLElement} */
                const ellipsis = el.querySelector(".ellipsis");

                if (!Resume.isIOS) {
                    ellipsis.style.transition = "all 0.5s ease-in-out";
                }
                ellipsis.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
                ellipsis.style.opacity = "0";

                /** @type {HTMLElement} */
                const comma = el.querySelector(".comma");
                if (comma) {
                    if (!Resume.isIOS) {
                        comma.style.transition = "all 0.5s ease-in-out";
                    }
                    comma.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
                    comma.style.opacity = "0";
                }

                transform = el.style.transform;
            } else {
                el.style.opacity = "0";
            }
        }

        await Resume.sleep(500);

        // Remove comma from back brace/bracket.
        if (backBrace.classList.contains("back-brace")) {
            backBrace.innerText = "}";
        } else {
            backBrace.innerText = "]";
        }

        // Clone remaining objects.
        const jsonRoot = document.getElementById("json-root"),
            keyRect = keyEl.getBoundingClientRect(),
            frontRect = frontBrace.getBoundingClientRect(),
            backRect = backBrace.getBoundingClientRect();

        const keyClone = /** @type {HTMLDivElement} */(keyEl.cloneNode(true)), // eslint-disable-line no-extra-parens
            frontClone = /** @type {HTMLDivElement} */(frontBrace.cloneNode(true)), // eslint-disable-line no-extra-parens
            backClone = /** @type {HTMLDivElement} */(backBrace.cloneNode(true)); // eslint-disable-line no-extra-parens

        // Remove all other extraneous elements from the scene.
        Resume.elements.forEach((el) => {
            el.remove();
        });

        Resume.elements.splice(0, Resume.elements.length);

        // Setup initial position for remaining elements.
        const link = keyClone.querySelector("a");

        keyClone.classList.remove("key");
        link.classList.remove("key");
        link.classList.add("return");

        const scale = +transform.slice(6, -1);

        keyClone.style.transition = "all 0.5s ease-in-out";
        keyClone.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
        keyClone.style.position = "absolute";
        keyClone.style.left = `${keyRect.x}px`;
        keyClone.style.top = `${keyRect.y - 72 * scale}px`;
        keyClone.style.transform = transform;
        keyClone.classList.add("return");

        frontClone.style.transition = "all 0.5s ease-in-out";
        frontClone.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
        frontClone.style.position = "absolute";
        frontClone.style.left = `${frontRect.x}px`;
        frontClone.style.top = `${frontRect.y - 72 * scale}px`;
        frontClone.style.transform = transform;

        backClone.style.transition = "all 0.5s ease-in-out";
        backClone.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
        backClone.style.position = "absolute";
        backClone.style.left = `${backRect.x}px`;
        backClone.style.top = `${backRect.y - 72 * scale}px`;
        backClone.style.transform = transform;

        jsonRoot.appendChild(keyClone);
        jsonRoot.appendChild(frontClone);
        jsonRoot.appendChild(backClone);

        await Resume.sleep(1);

        // Start animation of remaining elements.
        let left = 0;

        if (Resume.currentRoot.length === 0) {
            const rootFrontBrace = document.getElementById("front-brace");

            left = rootFrontBrace.getBoundingClientRect().width + 10;
        } else {
            const frontBraces = document.querySelectorAll("#json-root div.front-brace, #json-root div.front-bracket"),
                lastFrontBrace = frontBraces[frontBraces.length - 2],
                rect = lastFrontBrace.getBoundingClientRect();

            left = rect.x + rect.width + 10;
        }

        keyClone.style.left = `${left}px`;
        keyClone.style.top = "24px";
        keyClone.style.transform = "scale(0.0333)";

        left += 0.0333 * keyClone.getBoundingClientRect().width / scale + 10;

        frontClone.style.left = `${left}px`;
        frontClone.style.top = "24px";
        frontClone.style.transform = "scale(0.0333)";

        let top = 0;

        if (Resume.currentRoot.length === 0) {
            const rootBackBrace = document.getElementById("back-brace"),
                rect = rootBackBrace.getBoundingClientRect();

            left = rect.x - rect.width - 10;
            top = rect.y;
        } else {
            const backBraces = document.querySelectorAll("#json-root div.back-brace, #json-root div.back-bracket"),
                lastBackBrace = backBraces[backBraces.length - 2],
                rect = lastBackBrace.getBoundingClientRect();

            left = rect.x - rect.width - 10;
            top = rect.y;
        }

        backClone.style.left = `${left}px`;
        backClone.style.top = `${top}px`;
        backClone.style.transform = "scale(0.0333)";

        await Resume.sleep(500);

        // Create the next object.
        Resume.currentRoot.push(key);

        await Resume.createFromNode(Resume.currentRoot);

        // Setup click events on the return links.
        /** @type {NodeListOf<HTMLAnchorElement>} */
        const returnEls = document.querySelectorAll("#json-root a.return");

        returnEls.forEach((el, index) => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener("click", (ev) => {
                ev.preventDefault();

                Resume.returnUp(index);

                return false;
            });
        });
    }

    //              #    #  #  ###   #  #  #
    //              #    #  #   #    ####  #
    //  ###   ##   ###   ####   #    ####  #
    // #  #  # ##   #    #  #   #    #  #  #
    //  ##   ##     #    #  #   #    #  #  #
    // #      ##     ##  #  #   #    #  #  ####
    //  ###
    /**
     * Get the HTML to render for the object.
     * @param {string | number} key The key.
     * @param {any} obj The object to render.
     * @param {boolean} comma Whether to render a comma.
     */
    static getHTML(key, obj, comma) {
        if (typeof obj === "string") {
            return /* html */`
                <div class="key"><span class="quote">${typeof key === "string" ? "\"" : ""}</span><span class="title">${key}</span><span class="quote">${typeof key === "string" ? "\"" : ""}</span>:</div>
                <div class="value"><span class="quote">"</span><span class="data">${Resume.replaceLinks(obj)}</span><span class="quote">"</span><span class="comma">${comma ? "," : ""}</span></div>
            `;
        } else if (obj instanceof Array) {
            // If the array is all strings, just display the full array.
            if (obj.find((el) => typeof el !== "string")) {
                return /* html */`
                    <div class="key"><span class="quote">${typeof key === "string" ? "\"" : ""}</span><span class="title"><a href="#" class="key" data-key="${key}">${key}</a></span><span class="quote">${typeof key === "string" ? "\"" : ""}</span>:</div>
                    <div class="value"><div class="front-bracket">[</div><span class="ellipsis">&nbsp;...&nbsp;</span><div class="back-bracket">]<span class="comma">${comma ? "," : ""}</span></div></div>
                `;
            }

            return /* html */`
                <div class="key"><span class="quote">${typeof key === "string" ? "\"" : ""}</span><span class="title">${key}</span><span class="quote">${typeof key === "string" ? "\"" : ""}</span>:</div>
                <div class="value"><div class="front-bracket">[</div>
                    ${obj.map((el, index) => /* html */`
                        <div class="subvalue"><span class="quote">"</span>${Resume.replaceLinks(el)}<span class="quote">"</span><span class="comma">${index + 1 === obj.length ? "" : ","}</span></div>
                    `).join("")}
                <div class="back-bracket">]<span class="comma">${comma ? "," : ""}</span></div></div>
            `;
        } else if (obj instanceof Object) {
            // If this is a map location, display it.
            if (obj._lat && obj._long) {
                return /* html */`
                    <div class="key"><span class="quote">${typeof key === "string" ? "\"" : ""}</span><span class="title">${key}</span><span class="quote">${typeof key === "string" ? "\"" : ""}</span>:</div>
                    <div class="value">
                        <div class="location">
                            <div class="address">
                                <span class="quote">"</span>${obj.address1 ? `${obj.address1}<br />` : ""}${obj.address2 ? `${obj.address2}<br />` : ""}${obj.city}${obj.state ? `, ${obj.state}` : ""}${obj.zip ? ` ${obj.zip}` : ""}${obj.country ? ` ${obj.country}` : ""}<span class="quote">"</span>
                            </div>
                            <div class="map" data-lat="${obj._lat}" data-long=${obj._long}></div>
                            <div class="comma">${comma ? "," : ""}</div>
                        </div>
                    </div>
                `;
            }

            // If there is a title for an object, display that instead of the ellipsis.
            let ellipsis = "...";

            if (obj._title) {
                ellipsis = obj[obj._title];
            }

            return /* html */`
                <div class="key"><span class="quote">${typeof key === "string" ? "\"" : ""}</span><span class="title"><a href="#" class="key" data-key="${key}">${key}</a></span><span class="quote">${typeof key === "string" ? "\"" : ""}</span>:</div>
                <div class="value"><div class="front-brace">{</div><span class="ellipsis">&nbsp;${ellipsis}&nbsp;</span><div class="back-brace">}<span class="comma">${comma ? "," : ""}</span></div></div>
            `;
        }

        return "";
    }

    // ##                   #   ##                     #
    //  #                   #  #  #                    #
    //  #     ##    ###   ###  #  #  ###    ##   ###   #      ###  #  #   ##   ###    ###
    //  #    #  #  #  #  #  #  #  #  #  #  # ##  #  #  #     #  #  #  #  # ##  #  #  ##
    //  #    #  #  # ##  #  #  #  #  #  #  ##    #  #  #     # ##   # #  ##    #       ##
    // ###    ##    # #   ###   ##   ###    ##   #  #  ####   # #    #    ##   #     ###
    //                               #                              #
    /**
     * Loads the OpenLayers API.
     * @returns {Promise} A promise that resolves when the OpenLayers API has been laoded.
     */
    static loadOpenLayers() {
        if (Resume.ol) {
            return Promise.resolve();
        }

        /** @type {HTMLLinkElement} */
        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = "https://cdn.jsdelivr.net/npm/ol@v10.6.1/ol.css";

        document.head.appendChild(link);

        /** @type {HTMLScriptElement} */
        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "https://cdn.jsdelivr.net/npm/ol@v10.6.1/dist/ol.js";

        return new Promise((resolve, reject) => {
            try {
                script.onload = () => {
                    Resume.ol = window.ol;
                    resolve();
                };
                script.onerror = reject;
            } catch (err) {
                reject(err);
            }

            document.head.appendChild(script);
        });
    }

    //                   ##                      #      #          #
    //                    #                      #                 #
    // ###    ##   ###    #     ###   ##    ##   #     ##    ###   # #    ###
    // #  #  # ##  #  #   #    #  #  #     # ##  #      #    #  #  ##    ##
    // #     ##    #  #   #    # ##  #     ##    #      #    #  #  # #     ##
    // #      ##   ###   ###    # #   ##    ##   ####  ###   #  #  #  #  ###
    //             #
    /**
     * Replaces links with an anchor tag to the link.
     * @param {string} str The text.
     * @returns {string} The text with an anchor tag in place of links.
     */
    static replaceLinks(str) {
        return str.replace(/^https?:\/\/.+$/, "<a target=\"_blank\" href=\"$&\">$&</a>");
    }

    //              #                      #  #
    //              #                      #  #
    // ###    ##   ###   #  #  ###   ###   #  #  ###
    // #  #  # ##   #    #  #  #  #  #  #  #  #  #  #
    // #     ##     #    #  #  #     #  #  #  #  #  #
    // #      ##     ##   ###  #     #  #   ##   ###
    //                                           #
    /**
     * Returns the Json display up to the specified parent index.
     * @param {number} index The index to return to.
     * @returns {Promise} A promise that resolves when the Json is displayed.
     */
    static async returnUp(index) {
        // Disable click events.
        /** @type {NodeListOf<HTMLAnchorElement>} */
        const els = document.querySelectorAll("#json-root a");

        els.forEach((el) => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener("click", (ev) => {
                ev.preventDefault();
                return false;
            });
        });

        // Add elements to remove to the element list.
        /** @type {NodeListOf<HTMLDivElement>} */
        const returnDivEls = document.querySelectorAll("#json-root div.return");

        /** @type {NodeListOf<HTMLDivElement>} */
        const frontEls = document.querySelectorAll("#json-root div.front-brace, #json-root div.front-bracket");

        /** @type {NodeListOf<HTMLDivElement>} */
        const backEls = document.querySelectorAll("#json-root div.back-brace, #json-root div.back-bracket");

        for (let i = returnDivEls.length - 1; i >= index; i--) {
            Resume.elements.push(returnDivEls[i]);
            Resume.elements.push(frontEls[i]);
            Resume.elements.push(backEls[i]);
        }

        // Fade out the elements to remove.
        Resume.elements.forEach((el) => {
            if (!Resume.isIOS) {
                el.style.transition = "all 0.5s ease-in-out";
            }
            el.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
            el.style.opacity = "0";
        });

        await Resume.sleep(500);

        // Remove the extraneous elements.
        Resume.elements.forEach((el) => {
            el.remove();
        });

        Resume.elements.splice(0, Resume.elements.length);

        // Draw the current object.
        while (Resume.currentRoot.length > index) {
            Resume.currentRoot.pop();
        }

        await Resume.createFromNode(Resume.currentRoot);

        // Setup click events on the return links.
        /** @type {NodeListOf<HTMLAnchorElement>} */
        const returnEls = document.querySelectorAll("#json-root a.return");

        returnEls.forEach((el, ix) => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener("click", (ev) => {
                ev.preventDefault();

                Resume.returnUp(ix);

                return false;
            });
        });
    }

    //        ##
    //         #
    //  ###    #     ##    ##   ###
    // ##      #    # ##  # ##  #  #
    //   ##    #    ##    ##    #  #
    // ###    ###    ##    ##   ###
    //                          #
    /**
     * Sleeps for the specified time.
     * @param {number} ms The time to sleep.
     * @returns {Promise} A promise that resolves when sleep is complete.
     */
    static sleep(ms) {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, ms);
        });
    }

    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the JSON.
     * @returns {Promise} A promise that resolves when the JSON is setup.
     */
    static async DOMContentLoaded() {
        // Initialize.
        Resume.currentRoot = [];
        Resume.elements = [];

        // Full screen the body.
        document.body.classList.add("fullscreen");
        Resume.SPA.onNavigate = () => {
            document.body.classList.remove("fullscreen");
        };

        // Set initial scale.
        const jsonRoot = document.getElementById("json-root"),
            frontBrace = document.getElementById("front-brace"),
            backBrace = document.getElementById("back-brace"),
            maxWidth = jsonRoot.clientWidth,
            maxHeight = jsonRoot.clientHeight,
            braceWidth = frontBrace.clientWidth,
            braceHeight = frontBrace.clientHeight,
            scale = Math.min(maxWidth / braceWidth, maxHeight / braceHeight);

        // Set initial position.
        frontBrace.style.left = "0";
        frontBrace.style.top = "0";
        frontBrace.style.width = `${maxWidth / 2 / scale}px`;
        frontBrace.style.height = `${maxHeight / scale}px`;
        frontBrace.style.transform = `scale(${scale})`;
        frontBrace.style.textAlign = "right";

        backBrace.style.left = `${maxWidth / 2}px`;
        backBrace.style.top = "0";
        backBrace.style.width = `${maxWidth / 2 / scale}px`;
        backBrace.style.height = `${maxHeight / scale}px`;
        backBrace.style.transform = `scale(${scale})`;

        // Load OpenLayers.
        await Resume.loadOpenLayers();

        // Load JSON.
        try {
            // Change password on the server.
            const res = await fetch("/api/resume", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.status === 200) {
                Resume.json = JSON.parse((await res.json()).resume);
            }
        } catch (err) {
            console.log(err);
        }

        await Resume.sleep(500);

        // Animate to final position.
        frontBrace.style.transition = "all 0.5s ease-in-out";
        frontBrace.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
        frontBrace.style.width = `${braceWidth}px`;
        frontBrace.style.height = `${braceHeight}px`;
        frontBrace.style.top = "24px";
        frontBrace.style.transform = "scale(0.0333)";

        backBrace.style.transition = "all 0.5s ease-in-out";
        backBrace.style.transform = "-webkit-transform: translate3D(0, 0, 0)";
        backBrace.style.width = `${braceWidth}px`;
        backBrace.style.height = `${braceHeight}px`;
        backBrace.style.left = `${maxWidth - braceWidth * 0.05}px`;
        backBrace.style.top = `${maxHeight - braceHeight * 0.05}px`;
        backBrace.style.transform = "scale(0.0333)";

        await Resume.sleep(500);

        // Draw root object.
        await Resume.createFromNode(Resume.currentRoot);

        // Setup resize event.
        /**
         * Reload the window when the display is resized.
         * @returns {void}
         */
        const resizeEvent = () => {
            if (!jsonRoot) {
                window.removeEventListener("resize", resizeEvent);
                return;
            }

            window.location.reload();
        };

        window.addEventListener("resize", resizeEvent);
    }
}

/** @type {(string | number)[]} */
Resume.currentRoot = [];

/** @type {HTMLDivElement[]} */
Resume.elements = [];

Resume.isIOS = (/iPad|iPhone|iPod/).test(navigator.userAgent);

/** @type {object} */
Resume.json = null;

/** @type {any} */
Resume.ol = null;

/** @type {typeof import("./spa")} */
// @ts-ignore
Resume.SPA = typeof SPA === "undefined" ? require("./spa") : SPA; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Resume.DOMContentLoaded);
