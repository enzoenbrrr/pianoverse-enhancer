(async () => {
    async function waitForElement(selector) {
        const existingElement = document.querySelector(selector);
        if (existingElement) return existingElement;
      
        return new Promise(resolve => {
          const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
      
            if (element) {
              observer.disconnect();
              resolve(element);
            }
          });
      
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        });
    }

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
        const pHover = Math.round(127 + 128 * (value / 100));

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

    // Gestion de la position de l'image de fond
    const positionButtons = document.querySelectorAll('enhanced #bg-position-group button');
    positionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentBtn = e.currentTarget;
            
            // Retirer la classe 'active' de tous les boutons
            positionButtons.forEach(b => b.classList.remove('active'));
            // L'ajouter au bouton cliqué
            currentBtn.classList.add('active');
            
            // Récupérer et appliquer la nouvelle position
            const pos = currentBtn.getAttribute('data-pos');
            document.body.style.backgroundPosition = pos;
            
            // Sauvegarder dans le localStorage
            localStorage.setItem('enhanced-bg-position', pos);
        });
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

    // ---> NOUVEL ALGORITHME : EXTRAIRE LA COULEUR LA PLUS VIBRANTE
    function getVibrantColor(imgEl) {
        const defaultColor = '#4e68c7'; // Couleur par défaut
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return defaultColor;

        // Miniature pour traiter rapidement
        canvas.width = 64;
        canvas.height = 64;

        try {
            context.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
            const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
            
            // Création de 10 catégories (bins) pour classer les couleurs par teinte
            const bins = Array(10).fill(null).map(() => ({ r: 0, g: 0, b: 0, count: 0, weight: 0 }));
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const delta = max - min; // Différence entre couleurs fortes/faibles = vivacité
                
                // On zappe les grisés (delta faible), et les noirs/blancs extrêmes
                if (delta < 30 || max < 50 || max > 240) continue;
                
                // Calcul de la teinte (Hue de 0 à 360)
                let h = 0;
                if (max === r) h = ((g - b) / delta) % 6;
                else if (max === g) h = (b - r) / delta + 2;
                else h = (r - g) / delta + 4;
                
                h = Math.round(h * 60);
                if (h < 0) h += 360;
                
                // On met le pixel dans la bonne boîte
                const binIndex = Math.floor(h / 36) % 10;
                const weight = delta; // Plus c'est vif, plus ça a du poids
                
                bins[binIndex].r += r;
                bins[binIndex].g += g;
                bins[binIndex].b += b;
                bins[binIndex].count++;
                bins[binIndex].weight += weight;
            }
            
            // Trouver la boîte qui regroupe le plus de couleurs vives
            let bestBin = null;
            let maxWeight = 0;
            for (const bin of bins) {
                if (bin.weight > maxWeight) {
                    maxWeight = bin.weight;
                    bestBin = bin;
                }
            }
            
            // Si on a trouvé une belle couleur, on fait la moyenne juste pour ce groupe
            if (bestBin && bestBin.count > 0) {
                return `rgb(${~~(bestBin.r / bestBin.count)}, ${~~(bestBin.g / bestBin.count)}, ${~~(bestBin.b / bestBin.count)})`;
            }
            return defaultColor;
        } catch (e) {
            return defaultColor;
        }
    }

    // ---> FONCTION POUR APPLIQUER L'ACCENT COLOR
    function applyAccentColor(url) {
        const img = new Image();
        img.onload = () => {
            const color = getVibrantColor(img);
            document.body.style.setProperty('--color-accent', color);
            localStorage.setItem('enhanced-accent-color', color);
        };
        img.onerror = () => {
            document.body.style.setProperty('--color-accent', '#4e68c7');
        };
        img.src = url;
    }

    // Handle valid image detection
    async function onValidImageDetected(file) {
        await saveBackgroundFile(file);
        const url = URL.createObjectURL(file);
        document.body.style.backgroundImage = `url(${url})`;
        actualLink.innerHTML = `<b>Actual : </b><a href="${url}" target="_blank">${file.name}</a>`;
        localStorage.setItem('enhanced-backgroundImage-url', url);
        
        // Appliquer dynamiquement la couleur principale
        applyAccentColor(url);
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
    
    // La transition douce d'1 seconde pour la position du background
    document.querySelector('body').style.transition = 'background-position 500ms ease-in-out';

    // Remove the background from the app container
    document.querySelector("body > main.app").style.background = "none";

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

    // Mettre la couleur par défaut au démarrage
    document.body.style.setProperty('--color-accent', '#4e68c7');

    // Changement vers un fond dit Glassmophic
    async function applyGlassmorphicEffect(objects) {
        objects.forEach(async (obj) => {
            const style = `
                <style>
                    ${obj}::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: -1;
                        backdrop-filter: blur(var(--enhanced-blur));
                        webkit-backdrop-filter: blur(var(--enhanced-blur));
                        pointer-events: none;
                    }
                </style>
            `
            const element = await waitForElement(obj);
            element.style.border = `1px solid var(--color-border)`;
            element.style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.4)";
            element.style.background = "var(--color-surface)";
            element.style.position = "relative";
            element.style.overflow = "hidden";
            element.style.backdropFilter = "none";
            element.insertAdjacentHTML('beforebegin', style);
        });
    }

    const glassmorphicObjects = [
        "body > main.app > div.piano > pv-canvas > pv-toolbar > div > div.side-group.left > div.buttons > button",
        "body > main.app > div.piano > pv-canvas > pv-toolbar > div > div.side-group.left > div.group",
        "body > main.app > div.piano > pv-canvas > pv-toolbar > div > div.side-group.right > div.group",
        "body > main.app > div.piano > pv-canvas > pv-toolbar > div > div.side-group.right > div.buttons > button",
        "body > pv-header",
        "body > main.app > div.chat"
    ];
    await applyGlassmorphicEffect(glassmorphicObjects);

    // >> Specific styles for the header
    document.querySelector("body > main.app > div.piano > pv-canvas").style.overflow = "visible";
    document.querySelector("pv-keys").style.backgroundColor = "black";
    document.querySelector("pv-keys").style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.4)";
    document.querySelector("body > pv-header").style.overflow = "visible";
    document.querySelector("body > pv-header").style.borderWidth = "0 0 1px 0";

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

            body > main.app {
                z-index: 0;
            }

            pv-toolbar .item:hover, pv-toolbar .item.open {
                background: var(--color-hover);
            }

            pv-toolbar .item.toggle:hover {
                background-color: var(--color-hover);
            }
        `
        document.body.insertAdjacentElement('afterbegin', style);
    }

    // Add the enhanced menu icon to the header
    async function addIcon() {
        const header = await waitForElement("body > pv-header > div.right");
        const menuIcon = document.createElement('div');
        menuIcon.className = 'enhanced-custom-menu icon';
        menuIcon.setAttribute('data-tooltip', 'Enhanced');
        menuIcon.style.display = 'flex';
        menuIcon.style.justifyContent = 'center';
        menuIcon.innerHTML = '<i class="fa-solid fa-bolt-lightning" style="display: flex; justify-content: center; align-items: center;transition: 0.25s;"></i>';
        menuIcon.addEventListener('click', () => { document.querySelector('enhanced').style.display = "flex" });
        header.insertBefore(menuIcon, document.querySelector("body > pv-header > div.right > button.sign-in"));
    };

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
            
            // Restauration ou calcul de l'accent color
            const savedAccent = localStorage.getItem("enhanced-accent-color");
            if (savedAccent) {
                document.body.style.setProperty('--color-accent', savedAccent);
            } else {
                applyAccentColor(lastSaveUrl);
            }
        }
    
        const lastSaveBlur =
            localStorage.getItem("enhanced-blur");
    
        const lastSaveBackground =
            localStorage.getItem("enhanced-background");
            
        // Restauration de la position de l'image de fond
        const lastSaveBgPosition = localStorage.getItem("enhanced-bg-position");
    
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
        
        // Appliquer l'ancienne position ou centré par défaut
        if (lastSaveBgPosition) {
            document.body.style.backgroundPosition = lastSaveBgPosition;
            
            // Remettre la classe active sur le bon bouton
            const positionButtons = document.querySelectorAll('enhanced #bg-position-group button');
            if(positionButtons.length > 0) {
                positionButtons.forEach(b => b.classList.remove('active'));
                const activeBtn = document.querySelector(`enhanced #bg-position-group button[data-pos="${lastSaveBgPosition}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            }
        }
    }

    setBeforeStyle();
    addIcon();
    formatLastSave();
})();