// ==UserScript==
// @name         Draggable Text Redirect
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Open dragged text in a new tab based on a base URL
// @author       You
// @grant        GM_openInTab
// @match        *://*/*
// @icon         https://img.icons8.com/?size=100&id=Sm9xAvXfn1wF&format=png&color=000000
// @require      data:text/plain;base64,d2luZG93LnRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2RlZmF1bHQnLCB7IGNyZWF0ZUhUTUw6IHN0ciA9PiBzdHIsIGNyZWF0ZVNjcmlwdFVSTDogc3RyPT4gc3RyLCBjcmVhdGVTY3JpcHQ6IHN0cj0+IHN0ciB9KTs=
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

/* eslint-disable */

(function($) {
    'use strict';

    $.noConflict();

    const google = "https://www.google.com/search?q=%s";
    const youtube = "https://www.youtube.com/results?search_query=%s";

    let redirectUrl = null;
    let isDragging = false;
    let selectedText = null;
    let selectionBoundingRect = null;
    let isAltPressed = false;
    let isNearTabArea = false;

    $(document).on('selectionchange', function() {
        const selection = window.getSelection();
        if (selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            selectionBoundingRect = range.getBoundingClientRect();
        }
    });

    $(document).on('dragstart', function(e) {
        if (e.altKey) {
            isAltPressed = true;
            return;
        }
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim() !== '' && selectionBoundingRect) {
            selectedText = selection.toString();
            e.originalEvent.dataTransfer.setData('text/plain', selectedText);
            isDragging = true;
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent image
            e.originalEvent.dataTransfer.setDragImage(img, 0, 0);
        }
    });

    $(document).on('dragover', function(e) {
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

        isNearTabArea = y <= 5;

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

    $(document).on('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            redirectUrl = null;
            console.log('Escape key pressed');
        }
    });

    $(document).on('dragend', function(event) {
        const dropEffect = event.originalEvent.dataTransfer.dropEffect;
        document.body.style.cursor = 'default';
        isDragging = false;
        if (dropEffect === 'none' || isAltPressed || isNearTabArea) {
            // Do nothing
        } else {
            if (redirectUrl && selectedText) {
                let finalUrl = redirectUrl.replace("%s", encodeURIComponent(selectedText));
                console.log(`Opening: ${finalUrl}`);

                GM_openInTab(finalUrl, true);

            }
        }
    });

})(jQuery);
