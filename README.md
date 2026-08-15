# ✨ Pianoverse enhancer for you !

This repository makes [**Pianoverse**](https://pianoverse.net) look amazing by allowing you to add a background using an image of your choice with glassmorphism design.

<img width="960" height="540" alt="Renderer with 'La Liberté Guidant le Peuple" src="https://github.com/user-attachments/assets/cbc50990-0bfe-4d55-be06-c61c05ab6de4" />

## Available Options

- **Background Image :** From your **own files**, a **URL**, or by **drag-and-drop**.

- **Blur :** In a range of **0** to **5rem**.

- **Opacity :** The opacity varies from **0** to **0.5**, whether in black or white.

- **Saving options :** By **using IndexedDB**, the selected options and the image will be saved for the next session..

|Allowed Formats|
|---------------|
|`.jpeg`|
|`.jpg`|
|`.png`|
|`.webp`|
|`.gif`|
|`.avif`|

## Requirements

To use this script in your browser, you need:

- **Tampermonkey** (userscript manager extension)
  - On Chrome: search for “Tampermonkey” in the Chrome Web Store
  - On Firefox: search for “Tampermonkey” in the Add-ons

Once Tampermonkey is installed, you can create a new script and paste the code below.

## Script installation

### Automatically

> [!WARNING]
> You must already have TamperMonkey installed.

Access the **[extension.user.js](extension.user.js)** file, click the `raw` button, and then follow the **TamperMonkey** instructions.

### Manually

1. Open the Tampermonkey dashboard.
2. Create a **new script**.
3. Delete the default template content.
4. Copy and paste the following code:

```js
// ==UserScript==
// @name         Pianoverse Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Makes Pianoverse look amazing by allowing you to add a background using an image of your choice with glassmorphism design.
// @author       enzoenbrrr
// @match        https://pianoverse.net/*
// @icon         data:image/gif;base64,/9j/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIAEAAQAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AM0CngUgFOA4qRgBS4qjHqCLq8unyZWTYJI89HHfH0q67rFG0kjBUUZZicACgQuKTBrl/wDhM4Jb8wwIDHu2hj35PI/SuoGSgYgjIzg9qBjSKbipCKYRQA4U8UwYp46UAZHiLSW1KxD25KXkB3wupwc+n4159qfiLU9Qt0tbmUqsY2uFG0uf9qu81GDxDczrFa3Nvb25+9IoywH4/wD1qwNL8FNd3E82o3LMqysvyH5pCDyST0zTTJaI/B3hxbpk1S5IMSN+6QHqR3P+FegGq1hp1rpkJhtI/LjJyV3E84x3q1SKGHmmGpDTCKAAGngisQaspfOcL1q3HeBlBB4NK5XKzRBpiQxxNIyKAZG3NjucAf0FQfbY127nVdw7mpYp0lHyurfQ0ySnqt0sMcZRm8xW5AbAA9/WtBWDKCDkEdfWuY8QQ3EUzzIVMJG4knoe9X9B1FLi3+zOSs0X8DcHFJMbNg0w0pNNJpiPMmvjtODgkYP51rLqmNPbkq5iJU+pzXKeYM9alFx8gQE4AxUctjRzuErvJyzEnPU802Kea2fzIZWjYfxKcGmNICKaWBBGa0Rz2JHup7jDSyM7HuxJrY8MXU6a/br5h2uSrAnORisFThcelXtJvk0/UoLt1LLGTlQeTwR/WncLHrBNMJrlD46tOf8ARZvzFNPjm0P/AC6zfmKmxrdH/9k=
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    fetch('https://raw.githubusercontent.com/enzoenbrrr/pianoverse-enhancer/refs/heads/main/script.js')
    .then(response => response.text())
    .then(script => {eval(script);})
})();
```

5. Save the script.
6. Open Pianoverse and go to the chat: the emojis should now be available.

> [!CAUTION]
> - This is an **unofficial userscript** for Pianoverse.
> - Use it at your own risk and make sure it complies with Pianoverse’s terms of use.
> - Behavior may change if Pianoverse updates its interface or underlying code.

## Contributing

I am **enzoenbrrr**, enzoɞ `#mlk4kc85` on Pianoverse, and the sole contributor to this project. However, I am open to suggestions for updates and improvements !

> [!TIP]
> You can contact me via Discord if you run into a problem or wish to chat : **[enzoenbrrr](https://discord.com/users/450214806335782922)**
