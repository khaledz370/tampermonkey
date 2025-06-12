// ==UserScript==
// @name         Draggable Text Redirect
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Open dragged text in a new tab based on a base URL
// @author       You
// @match        *://*/*
// @grant        none
// @icon         https://img.icons8.com/?size=100&id=Sm9xAvXfn1wF&format=png&color=000000
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

/* eslint-disable */
(function($) {
    'use strict';

    const google = "https://www.google.com/search?q=%s";
    const youtube = "https://www.youtube.com/results?search_query=%s";

    let redirectUrl = null;
    let isDragging = false;
    let selectedText = null;
    let selectionBoundingRect = null;
    let isAltPressed = false;

    $(document).on('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            selectionBoundingRect = range.getBoundingClientRect();
        }
    });

    $(document).on('dragstart', (e) => {
        if (e.altKey) {
            isAltPressed = true
            return;
        }
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim() !== '' && selectionBoundingRect) {
            selectedText = selection.toString();
            e.originalEvent.dataTransfer.setData('text/plain', selectedText);
            isDragging = true;
            const img = new Image();
            img.src = ''; // transparent image
            e.originalEvent.dataTransfer.setDragImage(img, 0, 0);
        }
    });

    $(document).on('dragover', (e) => {
        if (!isDragging || !selectionBoundingRect) return;

        isAltPressed = event.altKey;

        if (!isAltPressed) {
            e.preventDefault();
        }

        $('body').css('cursor', 'grabbing');

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

    $(document).on('dragend', (event) => {
        const originalEvent = event.originalEvent;
        const dropEffect = originalEvent?.dataTransfer?.dropEffect;
        const isNoDrop = dropEffect === 'none' || isAltPressed;

        $('body').css('cursor', 'default');
        isDragging = false;

        if (isNoDrop) return;

        if (redirectUrl && selectedText) {
            const finalUrl = redirectUrl.replace('%s', encodeURIComponent(selectedText));
            console.log(`Opening: ${finalUrl}`);
            window.open(finalUrl, '_blank');
        }
    });

})(jQuery);
