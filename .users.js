// ==UserScript==
// @name         Youtube userscript
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try and improve some youtube controls
// @author       Tamas Varga
// @homepageURL  https://github.com/TomVarga/Youtube-userscript
// @match        https://www.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
// heavily inspired by https://greasyfork.org/en/scripts/38575-youtube-advanced-speed-controller
(function() {
    'use strict';
    const initialRate = 1.5;
    //sets the initial rate of a youtube video
    function setInitialRate() {
        document.getElementsByClassName("html5-video-container")[0]
        .getElementsByClassName("video-stream html5-main-video")[0]
        .playbackRate = initialRate;
    }

    //sets the rate of a youtube video
    function setRate(n) {
        document.getElementsByClassName("html5-video-container")[0]
        .getElementsByClassName("video-stream html5-main-video")[0]
        .playbackRate = n;
    }

    //gets the current rate of a youtube video
    function getRate() {
        return document.getElementsByClassName("html5-video-container")[0]
            .getElementsByClassName("video-stream html5-main-video")[0]
            .playbackRate;
    }

    //determines if theres a video bar to inject onto
    function hasVideo() {
        return document.getElementsByClassName("ytp-right-controls").length != 0;
    }


    //injects the speed controller
    function injectController() {

        //create speed controller
        var i = document.createElement('input');
        i.style = "width: 30%; height: 70%; position: relative; bottom: -15%; background-Color: transparent; color: white; border-Color: transparent;";
        i.id = 'spdctrl';
        i.title = 'Playback Rate';
        i.style.fontSize = '100%';
        i.type = 'number';
        setRate(initialRate); // set initial playback speed
        i.value = getRate();
        i.step = 0.1;
        i.max = 16;
        i.min = 0;
        i.onchange = function() {
            var s = i.value;
            setRate(s);
        };
        i.addEventListener('wheel', function(e) {
            e.preventDefault();
            var current = parseFloat(i.value) || 0;
            var delta = e.deltaY < 0 ? 0.1 : -0.1;
            var next = Math.round((current + delta) * 10) / 10;
            next = Math.min(parseFloat(i.max), Math.max(parseFloat(i.min), next));
            setRate(next);
            i.value = next;
        });

        function updateButtonLabel() {
            b.textContent = getRate().toFixed(1) + 'x';
        }

        // quick-toggle button between 1.0x and initialRate x playback
        var b = document.createElement('button');
        b.style = "height: 70%; position: relative; bottom: -15%; margin-left: 4px; background-Color: transparent; color: white; border: 1px solid rgba(255,255,255,0.5); cursor: pointer;";
        b.title = 'Toggle playback speed (1.0x / ${initialRate}x)';
        b.onclick = function() {
            var current = getRate();
            var next = current >= initialRate ? 1.0 : initialRate;
            setRate(next);
            i.value = next;
            updateButtonLabel();
        };
        updateButtonLabel();

        //make the standard speed controls change the new speed controller
        document.getElementsByTagName('video')[0].onratechange = function() {
            if (document.activeElement != i) { //only change i's value if its not being focused (ie, just clicked on)
                i.value = getRate();
            }
            updateButtonLabel();
        };

        //put speed controller in youtube bar
        toolbar = document.getElementsByClassName("ytp-right-controls")[0];
        toolbar.prepend(b);
        toolbar.prepend(i);

    }

    //every fraction of a second check if the controller's injected and if theres a video
    //I have to do this because I don't think theres an easy way to detect the crazy history rewrite stuff that they do to give the illusion of you loading a page when you're actually not
    window.setInterval(function(){
        var controller = document.getElementById('spdctrl');
        if (controller === null && hasVideo()) {
            injectController();
        }
    }, 300);

})();