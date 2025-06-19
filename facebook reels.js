// ==UserScript==
// @name         facebook reels
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *.facebook.com/reel/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==
/* eslint-disable */

const clog = (...array)=>{
    console.log(...array)
}

(function() {
    'use strict';
    var url = $(location).attr('href')

    const addControls = (vid,dontpause) =>{

        if(dontpause){
            vid.trigger('pause')
        }
        vid.prop("controls",true)
        vid.prop("volume",0.2)
        vid[0].muted = false
    }
    const check = (dontpause) =>{
        if(url.indexOf('reel')!=-1){
            if($('video').length){
                addControls($('video'),dontpause)
            }else{
                //clog('video doesn\' exists_')
                setTimeout(()=>{check(true)},500)
            }
        }
    }
    check(true)
    setInterval(()=>{
        var newUrl = $(location).attr('href')
        if(url != newUrl){
            check(false)
            url = newUrl
        }
    },1000)


})();

