(async () => {
    // Save user options
    const DB_NAME = "enhanced-db";
    const STORE_NAME = "background";

    function openBackgroundDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveBackgroundFile(file) {
        const db = await openBackgroundDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            store.put(file, "current-background");

            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async function getBackgroundFile() {
        const db = await openBackgroundDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get("current-background");

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => reject(request.error);
        });
    }
    


    const maxBlur = 5; // Maximum blur value in rem
    const maxOpacity = 0.5; // Maximum opacity value

    // Add enhancer menu to the DOM
    await fetch('https://raw.githubusercontent.com/enzoenbrrr/pianoverse-enhancer/refs/heads/main/src/index.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
        });

    // Update the blur value when the slider is moved
    document.querySelector('enhanced .en-slider input#blur').addEventListener('input', (event) => {
        const value = event.target.value;
        event.target.style.setProperty('--value', `${value}%`);
        const blurValue = (value / 100) * maxBlur;
        document.querySelector('enhanced').style.setProperty('--blur', `${blurValue}rem`);
        document.querySelector(`label[for="${event.target.id}"]`).textContent = `${value}%`;
        document.body.style.setProperty('--enhanced-blur', `${blurValue}rem`);
        localStorage.setItem('enhanced-blur', value);
    });

    // Update the opacity value when the slider is moved
    document.querySelector('enhanced .en-slider input#opacity').addEventListener('input', (event) => {
        const value = event.target.value;
        const absValue = Math.abs(((value * 2) - 100));
        event.target.style.setProperty('--value', `${value}%`);
        const nuanceLabel = ((value * 2) - 100) / absValue === -1 ? "B" : "W";
        const valueLabel = event.target.id == "opacity" ? `${absValue}%` : `${value}%`;
        const pHover = Math.round(127 + 128*(value / 100));

        if (nuanceLabel === "B") {
            document.querySelector('enhanced').style.setProperty('--background', `rgba(0, 0, 0, ${maxOpacity * (absValue / 100)})`);
            document.body.style.setProperty('--color-surface', `rgba(0, 0, 0, ${maxOpacity * (absValue / 100)})`);
            document.body.style.setProperty('--color-surface-alt', `rgba(0, 0, 0, ${maxOpacity * (absValue / 100)})`);

            document.body.style.setProperty('--color-hover', `rgba(${pHover}, ${pHover}, ${pHover}, 0.2)`);
        } else {
            document.querySelector('enhanced').style.setProperty('--background', `rgba(255, 255, 255, ${maxOpacity * (absValue / 100)})`);
            document.body.style.setProperty('--color-surface', `rgba(255, 255, 255, ${maxOpacity * (absValue / 100)})`);
            document.body.style.setProperty('--color-surface-alt', `rgba(255, 255, 255, ${maxOpacity * (absValue / 100)})`);

            document.body.style.setProperty('--color-hover', `rgba(${pHover}, ${pHover}, ${pHover}, 0.2)`);
        }

        document.querySelector(`label[for="${event.target.id}"]`).textContent = `${event.target.id == "opacity" ? nuanceLabel : ""}${valueLabel}`;
        localStorage.setItem('enhanced-background', value);
    });

    // Close the enhanced menu when the quit button is clicked
    document.querySelector('#en-quit').addEventListener('click', () => {
        document.querySelector('enhanced').style.display = "none";
    });

    const dropbox = document.querySelector('enhanced #dropbox');
    const fileInput = document.querySelector('enhanced #fileInput');
    const actualLink = document.querySelector('enhanced #actual-link');

    // Allowed image types for validation
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif'
    ];

    // Returns true if the file is a valid image type, false otherwise
    function isValidImageFile(file) {
        if (!file || !file.type) return false;
        return ALLOWED_TYPES.includes(file.type.toLowerCase());
    }

    // Handle valid image detection
    async function onValidImageDetected(file) {
        await saveBackgroundFile(file);
        document.body.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
        actualLink.innerHTML = `<b>Actual : </b><a href="${URL.createObjectURL(file)}" target="_blank">${file.name}</a>`;
        localStorage.setItem('enhanced-backgroundImage-url', URL.createObjectURL(file));
    }

    // When the user selects a file via the selector
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (isValidImageFile(file)) {
            onValidImageDetected(file);
        } else {
            actualLink.innerHTML = '<b>Actual : </b>File not valid or unsupported format.';
        }
        fileInput.value = '';
    });

    // --- Drag & drop ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropbox.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropbox.addEventListener(eventName, () => {
            dropbox.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropbox.addEventListener(eventName, () => {
            dropbox.classList.remove('dragover');
        }, false);
    });

    dropbox.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        const file = files[0];

        if (isValidImageFile(file)) {
            onValidImageDetected(file);
        } else {
            actualLink.innerHTML = '<b>Actual : </b>File not valid or unsupported format.';
        }
    });

    // Initial setup for the body background and CSS variables
    document.querySelector('body').style.backgroundImage = `none`;
    document.querySelector('body').style.backgroundPosition = 'center';
    document.querySelector('body').style.backgroundSize = 'cover';

    // Remove the background from the app container
    document.querySelector("body > div.app").style.background = "none";

    // Modify CSS variables for colors and effects
    document.body.style.setProperty('--color-surface', 'rgba(255, 255, 255, 0.1)');
    document.body.style.setProperty('--color-surface-alt', 'rgba(255, 255, 255, 0.1)');

    document.body.style.setProperty('--color-hover', 'rgba(255, 255, 255, 0.2)');
    document.body.style.setProperty('--color-hover-alt', 'rgba(255, 255, 255, 0.1)');

    document.body.style.setProperty('--color-text', 'white');
    document.body.style.setProperty('--color-text-muted', 'rgba(255, 255, 255, 0.75)');

    document.body.style.setProperty('--color-border', `rgba(252, 252, 252, 0.136)`);
    document.body.style.setProperty('--color-border-alt', `rgba(252, 252, 252, 0.136)`);

    document.body.style.setProperty('--color-notice-background', 'rgba(255, 255, 255, 0.1)');

    document.body.style.setProperty('--enhanced-blur', '1.5rem');

    // Changement vers un fond dit Glassmophic
    function applyGlassmorphicEffect(objects) {
        objects.forEach(obj => {
            obj.style.backdropFilter = "blur(var(--enhanced-blur))";
            obj.style.border = `1px solid rgba(252, 252, 252, 0.136)`;
            obj.style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.4)";
        });
    }

    const glassmorphicObjects = [
        document.querySelector("body > div > div.piano > pv-canvas > pv-toolbar > div > div.side-group.left > div.buttons > button"),
        document.querySelector("body > div > div.piano > pv-canvas > pv-toolbar > div > div.side-group.left > div.group"),
        document.querySelector("body > div > div.piano > pv-canvas > pv-toolbar > div > div.side-group.right > div.group"),
        document.querySelector("body > div > div.piano > pv-canvas > pv-toolbar > div > div.side-group.right > div.buttons > button")
    ];
    applyGlassmorphicEffect(glassmorphicObjects);

    // >> Specific styles for the header
    document.querySelector("body > div > div.piano > pv-canvas").style.overflow = "visible";
    document.querySelector("pv-keys").style.backgroundColor = "black";
    document.querySelector("pv-keys").style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.4)";

    document.querySelector("body > pv-header > div.right").insertAdjacentHTML('afterbegin', `
        <style>
            body > pv-header {
                position: relative;
                z-index: 1;
                background: var(--color-surface);
                border-bottom: 1px solid var(--color-border);
                box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
            }

            body > pv-header > div.left {
                z-index: 1000;
            }

            body > pv-header > div.right .icon::before {
                    background: var(--color-surface);
                    backdrop-filter: blur(var(--enhanced-blur));
                    -webkit-backdrop-filter: blur(var(--enhanced-blur));
                    border: 1px solid var(--color-border);
            }

            body > pv-header > div.right > button.sign-in {
                z-index: 1;
            }
        </style>
    `);

    // Add the enhanced menu icon to the header
    function addIcon() {
        const header = document.querySelector("body > pv-header > div.right");
        const menuIcon = document.createElement('div');
        menuIcon.className = 'enhanced-custom-menu icon';
        menuIcon.setAttribute('data-tooltip', 'Enhanced');
        menuIcon.style.display = 'flex';
        menuIcon.style.justifyContent = 'center';
        menuIcon.innerHTML = '<i class="fa-solid fa-bolt-lightning" style="display: flex; justify-content: center; align-items: center;transition: 0.25s;"></i>';
        menuIcon.addEventListener('click', () => { document.querySelector('enhanced').style.display = "flex" });
        header.insertBefore(menuIcon, document.querySelector("body > pv-header > div.right > button.sign-in"));
    };

    // Appliquer les styles aux elements temporaires
    function setBeforeStyle() {
        const style = document.createElement('style');
        style.innerHTML = `
            body dialog > div::before {
                content: "";
                position: absolute;
                inset: 0;
                z-index: -1;
            
                background: rgb(255 255 255 / 0%);
                backdrop-filter: blur(var(--enhanced-blur));
                -webkit-backdrop-filter: blur(var(--enhanced-blur));
            
                pointer-events: none;
            }

            pv-notification {
                backdrop-filter: blur(var(--enhanced-blur));
                -webkit-backdrop-filter: blur(var(--enhanced-blur));
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                opacity: 1;
            }

            pv-notification .container {
                border: none;
            }

            pv-stepper .input {
                background-color: transparent;
            }

            pv-header::before {
                content: "";
                position: absolute;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
                backdrop-filter: blur(var(--enhanced-blur));
                -webkit-backdrop-filter: blur(var(--enhanced-blur));
            }

            body > div.app {
                z-index: 0;
            }

            body > div > div.chat {
                position: relative;
                z-index: 1;
                background: var(--color-surface);
                border-bottom: 1px solid var(--color-border);
                box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
            }

            body > div > div.chat::before {
                content: "";
                position: absolute;
                inset: 0;
                z-index: -1;
                backdrop-filter: blur(var(--enhanced-blur));
                -webkit-backdrop-filter: blur(var(--enhanced-blur));
            }
        `
        document.body.insertAdjacentElement('afterbegin', style);
    }

    // Formating to the last save
    async function formatLastSave() {
        const file = await getBackgroundFile();
    
        if (file) {
            const lastSaveUrl = URL.createObjectURL(file);
    
            document.body.style.backgroundImage =
                `url("${lastSaveUrl}")`;
    
            actualLink.innerHTML =
                `<b>Actual : </b>
                 <a href="${lastSaveUrl}" target="_blank">
                     Last saved background
                 </a>`;
        }
    
        const lastSaveBlur =
            localStorage.getItem("enhanced-blur");
    
        const lastSaveBackground =
            localStorage.getItem("enhanced-background");
    
        const blurInput =
            document.querySelector("enhanced .en-slider input#blur");
    
        if (blurInput && lastSaveBlur !== null) {
            blurInput.value = lastSaveBlur;
    
            blurInput.dispatchEvent(new Event("input", {
                bubbles: true
            }));
        }
    
        const opacityInput =
            document.querySelector("enhanced .en-slider input#opacity");
    
        if (opacityInput && lastSaveBackground !== null) {
            opacityInput.value = lastSaveBackground;
    
            opacityInput.dispatchEvent(new Event("input", {
                bubbles: true
            }));
        }
    }

    setBeforeStyle();
    await addIcon();
    formatLastSave();
})()