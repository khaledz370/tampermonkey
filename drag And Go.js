// ==UserScript==
// @name         Draggable Text Redirect
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Open dragged text in a new tab based on a base URL
// @author       You
// @grant        none
// @match        *://*/*
// @icon         https://img.icons8.com/?size=100&id=Sm9xAvXfn1wF&format=png&color=000000
// ==/UserScript==

(function() {
    'use strict';
    // Function to refresh the page

    const google = "https://www.google.com/search?q=%s";
    const youtube = "https://www.youtube.com/results?search_query=%s";

    let redirectUrl = null;
    let isDragging = false;
    let selectedText = null;
    let selectionBoundingRect = null;
    let isAltPressed = false;

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            selectionBoundingRect = range.getBoundingClientRect();
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.altKey) {
            isAltPressed = true;
            return;
        }
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim() !== '' && selectionBoundingRect) {
            selectedText = selection.toString();
            e.dataTransfer.setData('text/plain', selectedText);
            isDragging = true;
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent image
            e.dataTransfer.setDragImage(img, 0, 0);
        }
    });

    document.addEventListener('dragover', (e) => {
        if (!isDragging || !selectionBoundingRect) return;

        if (e.altKey) {
            isAltPressed = true;
        } else {
            isAltPressed = false;
            e.preventDefault();
        }

        document.body.style.cursor = 'grabbing';

        const x = e.clientX;
        const y = e.clientY;

        const rect = selectionBoundingRect;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        if (x < centerX && y < centerY) {
            // UL
            redirectUrl = google;
        } else if (x >= centerX && y < centerY) {
            // UR
            redirectUrl = google;
        } else if (x < centerX && y >= centerY) {
            // BL
            redirectUrl = youtube;
        } else {
            // BR
            redirectUrl = youtube;
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            redirectUrl = null;
            console.log('Escape key pressed');
        }
    });

    document.addEventListener('dragend', (event) => {
        const dropEffect = event.dataTransfer.dropEffect;
        document.body.style.cursor = 'default';
        isDragging = false;
        if (dropEffect === 'none' || isAltPressed) {
            // Do nothing
        } else {
            if (redirectUrl && selectedText) {
                let finalUrl = redirectUrl.replace("%s", encodeURIComponent(selectedText));
                console.log(`Opening: ${finalUrl}`);
                window.open(finalUrl, '_blank');
            }
        }
    });

})();
