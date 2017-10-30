// CS Custom HTML Video player library
// v1.1
// updated 01-04-17


//hide items
function hideThis( item ){
    for ( var i = 0; i < item.length; i++ ) {
        item[i].css( "display", "none" );
    }
}
//show items
function showThis( item ){
    for ( var i = 0; i < item.length; i++ ) {
        item[i].css( "display", "block" );
    }
}

//generate random number
function genRanNum(){
    return Math.floor( ( Math.random() * 100000 ) + 1 );
}

//determine if string is URL
function isURL( str ) {
    var regex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    return regex.test( str );
}


function CS_videoPlayer( options ) {
    var _self = this;
    _self.version = 2;
    _self.options = options;
    _self.controls = [];
    _self.styles = "https://creative.snidigital.com/cs-core/plugins/videoPlayer/CS_videoPlayer_baseCSS_v2.1.css";
    //_self.styles = "css/CS_videoPlayer_baseCSS_v2.1.css";


    /* SETUP VARIABLES */

    //setup global array of videos to hook into universal tracking
    if( typeof window.CS_videos === "undefined" ){
        window.CS_videos = [];
    }
    window.CS_videos.push( _self );

    //set current video
    _self.currentVideoNum = 0; //first item in the list by default
    if( typeof _self.options.startVideo !== "undefined" ){
        _self.currentVideoNum =  _self.options.startVideo - 1;
    }

    //plays inline
    if( typeof _self.options.playsInline === "undefined" ){
        _self.options.playsInline = false;
    }

    //set current video object
    //change this as videos change and use it to find data associated with that video
    _self.currentVideo = _self.options.videos[_self.currentVideoNum];

    //number of videos
    _self.numVideos = _self.options.videos.length;

    //tracking events
    _self.events = {};

    //number of events to complete before calling setupComplete
    _self.setupCount = 0;
    _self.setupCurrCount = 0;


    /*
        SETUP VIDEO
        initial setup of video tag etc, with user provided options
        Should run only once on page load
    */
    _self.setupVideo = function(){

        //load stylesheet
        if( $( "body" ).find( "#CS_videoPlayer_CSS" ).length === 0 ){
            $( "body" ).append( "<link rel='stylesheet' id='CS_videoPlayer_CSS' href='" + _self.styles + "' type='text/css' />" );
        }

        //determine if touch device
        if ( "ontouchstart" in document.documentElement ) {
            _self.isTouchDevice = true;
        } else {
            _self.isTouchDevice = false;
        }

        //find wrapper first, break if wrapper doesn't exist or not defined
        if(options.videoContainer.length > 0){
            _self.wrapper = options.videoContainer;
            _self.wrapper.addClass("CS_videoPlayer");
        }else{
            console.warn("Video wrapper not found, please define in video options.");
            console.warn("Video player startup aborted");
            return false;
        }
        //add new video object
        _self.wrapper.append('<video></video>');
        _self.video = _self.wrapper.find("video");

        if( _self.options.playsInline === true ){
            _self.video.attr("playsinline","true");
        }

        //add no-track feature so automated tracking doesn't track video tag events
        _self.video.attr("data-no_autotrack","true");

        //start muted
        if(_self.options.muted === true){
            _self.mute();
        }
        //show controls
        if(_self.options.showControls === true){
            _self.video.attr("controls", "controls");
        }

        //add event listeners for native play/pause events so they can utilize CS Player events instead
        _self.video.on('play', function (e) {
             if(_self.wrapper.attr("data-state") !== "playing"){
                 _self.play();
             }
        });
        _self.video.on('pause', function (e) {
            _self.pause();
        });

        //add image to use for tracking
        _self.wrapper.append("<img src='' class='tracking' style='display:none' />");
        _self.trackingImg = _self.wrapper.find(".tracking");

        //add overlay buttons
        if(_self.options.useOverlayButtons === true){
            _self.setupCount++;
            _self.setupOverlayBtns();
        }

        //add thumbnails
        if( _self.numVideos > 1 ){
            console.log("multiple videos, generate thumbnails");
            _self.setupCount++;
            _self.setupThumbs();
        }

        //setup poster image bucket
        _self.wrapper.append("<img class='poster' src='' />");
        _self.controls.poster = _self.wrapper.find(".poster");
        if(typeof _self.controls.poster !== "undefined"){
            _self.controls.poster.on("click", function(){
                _self.play("replay");
            });
        }
        if( _self.isTouchDevice === true ){
            console.log('hide poster on mobile');
            hideThis([_self.controls.poster]);
            console.log('unmute on mobile');
            _self.unmute();
        }
        setTimeout(function(){
            _self.controls.poster.css({
                //"width"     : _self.video.width(),
                //"height"    : _self.video.height(),
                "top"       : _self.video.position().top,
                "left"      : _self.video.position().left
            });
        },300);

        //add no-track feature so automated tracking doesn't track poster events
        //poster events are handled inside this library, not by the AT library.
        _self.controls.poster.attr("data-no_autotrack","true");

        //check if setup is done, if so fire callback
        _self.videoSetupComplete( "initial setup" );

    };

    /*
        LOAD VIDEO
        loads up selected video
        on start this is the 1st video or the start video
        this function is called when thumbnails trigger video to change
    */
    _self.loadVideo = function(video, status){
        if(typeof status === "undefined"){
            status = false;
        }
        //clear sources first if they exist
        if(_self.video.find("source").length > 0){
            _self.video.find("source").remove();
        }
        //load sources
        var sources = video.sources;
        for (var i = 0; i < sources.length; i++) {
            var type = sources[i].substring(sources[i].lastIndexOf(".") + 1);
            _self.video.append('<source src="' + sources[i] + '" type="video/' + type + '">');
        }

        //initiate video after sources loaded
        _self.video.load();

        //setup tracking for current
        _self.setupTracking(video);

        //autoplay
        //only if not on mobile device
        if(_self.options.autoplay === true && _self.isTouchDevice !== true){
            //not true autoplay, but does cause it to play
            console.log("play by autoplay");
            _self.play();
            if(_self.options.muted === false){
                _self.mute(); //also mute if options were set to false since autoplay should always be muted
            }
        }
        //in not autoplay show the poster image
        else if(status !== "thumbnail" || status !== "autoadvance"){
            if(typeof _self.controls.poster !== "undefined" && _self.isTouchDevice !== true){
                console.log("show poster");
                showThis([_self.controls.poster]);
            }
        }

        //play and unmute for secondary videos activated by thumbnails
        if(status === "thumbnail"){
            _self.play();
            _self.unmute();
        }else if(status === "autoadvance"){
            _self.play();
        }

        //show video overlay buttons as necessary
        if(_self.video.prop("muted") === true && _self.options.useOverlayButtons && _self.isTouchDevice !== true){
            if(typeof _self.controls.playAudio !== "undefined"){
                showThis([_self.controls.playAudio]);
            }
        }

        //setup poster
        _self.setPoster(video.poster);

        //activate thumbnail if using
        if(_self.numVideos > 1){
            var index = _self.options.videos.indexOf(video),
                thumb = _self.thumbs.children().eq(index);
            thumb.addClass("active");
            thumb.siblings().removeClass("active");

            //set current var
            _self.currentVideo = video;
            //set current video number
            _self.currentVideoNum = index;
        }
    };



    /*
        SETUP OVERLAY BUTTONS
        Called by setup video function, only called on page load and if option is set to true by user
        Adds overlay buttons like Play Audio and Replay and attaches click event listeners
    */
    _self.setupOverlayBtns = function(){
        console.log("using overlay buttons");
        //append wrapper
        _self.wrapper.append('<ul class="videoOverlayButtons"></div>');
        var overlay = _self.wrapper.find(".videoOverlayButtons");

        $.each( _self.options.overlayBtns, function( key, value ) {
            if(isURL(value) === true){
                overlay.append('<li class="overlayBtn imageButton ' + key + '"><img src="' + value + '"</li>');
            }else{
                overlay.append('<li class="overlayBtn textButton ' + key + '">' + value + '</li>');
            }
            _self.controls[key] = overlay.find("." + key);

            //add no-track feature so automated tracking doesn't track overlay button events
            //overlay events are handled inside this library, not by the AT library.
            _self.controls[key].attr("data-no_autotrack","true");
        });

        //play audio
        if(typeof _self.controls.playAudio !== "undefined"){
            //click
            _self.controls.playAudio.on("click",function(){
                console.log("play audio clicked");
                _self.unmute("restart");
            });
        }

        //replay
        if(typeof _self.controls.replay !== "undefined"){
            _self.controls.replay.on("click",function(){
                console.log("replay clicked");
                _self.play("replay");
            });
        }

        //check if setup is done, if so fire callback
        _self.videoSetupComplete( "overlay buttons" );
    };



    /*
        SET POSTER IMAGE
        Changes the source of the poster image to the provide image
    */
    _self.setPoster = function(image){
        console.log("setup new poster image");
        _self.controls.poster.attr("src", image);
        //check if sizing changed
        setTimeout(function(){
            if(_self.controls.poster.width() !== _self.video.width()){
                console.log("width changed");
                _self.controls.poster.css({
                    //"width"     : _self.video.width(),
                    //"height"    : _self.video.height(),
                    "top"       : _self.video.position().top,
                    "left"      : _self.video.position().left
                });
            }
        },500);

    };



    /*
        SETUP THUMBNAILS
        Called by setup video function, only called on page load and if multiple videos are provided
        Adds thumbails and attaches click event listeners
    */
    _self.setupThumbs = function(){
        //add wrapper
        _self.wrapper.after("<ul class='CS_thumbnails'></ul>");
        _self.thumbs = _self.wrapper.siblings(".CS_thumbnails");
        for (var i = 0; i < _self.numVideos; i++) {
            var v = _self.options.videos[i],
                thumbInfo = v.thumbnail;
            //check if thumbInfo exists
            if(typeof thumbInfo === "undefined" || thumbInfo === null){
                console.warn("Thumbnail info is not provided for video #", (i + 1));
            }else{
                //append thumbs
                _self.thumbs.append("<li class='thumb' data-video='" + i + "'></li>");
                var thisThumb = _self.thumbs.find("[data-video='" + i + "']");
                if(typeof thumbInfo.image !== "undefined" && thumbInfo.image !== null){
                    thisThumb.append("<img class='thumbImg' src='" + thumbInfo.image + "' />");
                }
                if(typeof thumbInfo.text !== "undefined" && thumbInfo.text !== null){
                    thisThumb.append("<span class='thumbName'>" + thumbInfo.text + "</span>");
                }
                if(typeof v.tag !== undefined){
                    thisThumb.attr("data-tag", v.tag);
                }
            }

        }

        //add click events
        _self.thumbs.find(".thumb").on("click",function(e){
            e.preventDefault();

            var newVideo = $(this).data("video");

            console.log("Now play video num", newVideo + 1);

            //fire thumbnail click tracking
            var thumbTracking = _self.options.videos[newVideo].thumbnail.click;
            if(typeof thumbTracking !== "undefined" && thumbTracking !== null){
                console.log(thumbTracking);
                _self.fireTracking(thumbTracking);
            }

            _self.pause(); //first pause video
            _self.loadVideo(_self.options.videos[newVideo], "thumbnail"); //true forces autoplay
        });

        //check if setup is done, if so fire callback
        _self.videoSetupComplete( "thumbs" );

    };



    /*
        SETUP TRACKING
        Called each time new video is loaded
        Data comes from specific video attribute
        Sets up trackingEvent array if quartiles which are then matched against current playhead position
    */
    _self.setupTracking = function(video){

        //check if tracking events are defined for current video
        if(typeof video.tracking === "undefined"){
            console.warn("no tracking has been defined for this video");
        }

        //setup time events for this video
        //will also clear any previously created time events
        _self.timeEvents = [];

        //push data to time events
        var trackingEvents = video.tracking;
        $.each( trackingEvents, function( key, value ) {
            //define ratio
            var trackRatio;
            switch (key) {
                case "start":
                    trackRatio = 1;
                    break;
                case "quarter":
                    trackRatio = 25;
                    break;
                case "half":
                    trackRatio = 50;
                    break;
                case "threequarter":
                    trackRatio = 75;
                    break;
                case "full":
                    trackRatio = 100;
                    break;
            }

            if(value !== null){
                if(key === "playaudio" && typeof _self.controls.playAudio !== "undefined"){
                    _self.events.audio = value;
                }
                else if(key === "replay" && typeof _self.controls.replay !== "undefined"){
                    _self.events.replay = value;
                }
                else{
                    _self.timeEvents.push({ name: key, ratio: trackRatio, track: value, hits: 0 });
                }
            }
        });

        _self.events.timeEvents = _self.timeEvents;

        //console.log(_self.timeEvents);
    };

    /*
        video setup complete function
        called when the video setup is completed, including thumbnails and overlay buttons if available
    */
    _self.videoSetupComplete = function( step ){
        if( typeof step !== "undefined"){
            console.log("video setup step:", step);
        }
        if(_self.setupCount === _self.setupCurrCount){
            if(typeof _self.options.videoSetup !== "undefined"){
                setTimeout(function(){
                    console.log("video setup complete, calling function", _self.options.videoSetup);
                    _self.options.videoSetup.call(_self);
                },100);
            }
        }
        _self.setupCurrCount++;
    };



    //get current tracking value - it could have been updated by automated tracking
    //called when a time event tag is about to be fired
    _self.getCurrentTrackingValue = function(name){
        return _self.currentVideo.tracking[name];
    };

    //fire the provided tag
    _self.fireTracking = function(tag){
        if(typeof tag !== "undefined" && tag !== ""){
            tag = tag
                .replace("$random$", genRanNum())
                .replace("%%CACHEBUSTER%%", genRanNum())
                .replace("[timestamp]", genRanNum());
            _self.trackingImg.attr("src", tag);
            console.log("fired tracking", tag);
        }
    };


    /////////////////////////////////////////  actions  ////////////////////////////////////
    _self.play = function(replay){
        console.log("play video");
        if(replay === "replay" || replay === "replayMuted"){
            //reset tracking hits
            for (var i = 0; i < _self.timeEvents.length; i++) {
                _self.timeEvents[i].hits = 0;
            }
            //start from the start
            _self.video.get(0).currentTime = 0;
        }

        //always hide the replay button
        if(typeof _self.controls.replay !== "undefined"){
            hideThis([_self.controls.replay]);
        }

        if(_self.options.useOverlayButtons && replay === "replay"){
            if(typeof _self.controls.playAudio !== "undefined"){
                hideThis([_self.controls.playAudio]);
            }

            //unmute
            if(_self.video.prop("muted") === true){
                _self.unmute();
            }
            //fire tracking
            if(typeof(_self.events.replay) !== "undefined"){
                _self.fireTracking( _self.getCurrentTrackingValue("replay"));
                //_self.fireTracking(_self.events.replay);
            }
        }

        //replay but don't unmute
        if(_self.options.useOverlayButtons && replay === "replayMuted"){
            if(typeof _self.controls.playAudio !== "undefined"){
                showThis([_self.controls.playAudio]);
            }
        }

        if(typeof(_self.controls.poster) !== "undefined"){
            hideThis([_self.controls.poster]);
        }
        _self.video.get(0).play();
        _self.wrapper.attr("data-state","playing");

        //if user defined play function run it
        if(typeof _self.options.videoPlay !== "undefined"){
            console.log(_self.options.videoPlay);
            _self.options.videoPlay.call(_self);
        }
    };

    _self.pause = function(){
        console.log("pause video");
        _self.video.get(0).pause();
        _self.wrapper.attr("data-state","paused");
    };

    _self.mute = function(){
        console.log("mute video");
        _self.video.attr("muted", true);
        _self.video.prop('muted', true);
    };
    _self.unmute = function(restart){
        console.log("unmute video");

        //restart if muted
        function restartWithAudio(){
            if( typeof _self.timeEvents !== "undefined" ){
                //reset tracking hits
                for (var i = 0; i < _self.timeEvents.length; i++) {
                    _self.timeEvents[i].hits = 0;
                }
            }
            if(typeof _self.controls.playAudio !== "undefined"){
                hideThis([_self.controls.playAudio]);
            }
            if(typeof _self.controls.replay !== "undefined"){
                hideThis([_self.controls.replay]);
            }
            _self.video.get(0).currentTime = 0;
            _self.play(); //call play function

            //tracking
            if(typeof(_self.events.audio) !== "undefined"){
                _self.fireTracking( _self.getCurrentTrackingValue("playaudio"));
            }
        }
        if(restart === "restart"){
            restartWithAudio(); //restart with audio because play with audio button was clicked
        }
        else if(_self.options.useOverlayButtons && _self.isTouchDevice === false){
            //unmute button was clicked, check if play with audio is visible first, if user then replay
            if(_self.controls.playAudio.css("display") === "list-item" || _self.controls.playAudio.css("display") === "block"){
                restartWithAudio();
            }
        }

        //unmute
        _self.video.prop('muted', false);
        _self.video.removeAttr("muted");

    };
    _self.videoEnd = function(){
        //show buttons
        if(_self.options.useOverlayButtons === true){
            if(typeof _self.controls.playAudio !== "undefined"){
                hideThis([_self.controls.playAudio]);
            }
            if(typeof _self.controls.replay !== "undefined"){
                showThis([_self.controls.replay]);
            }
        }
        //show poster
        if(typeof _self.controls.poster !== "undefined"){
            console.log("show poster");
            showThis([_self.controls.poster]);
        }

        //if user defined onEnd function run it
        if(typeof _self.options.videoEnd !== "undefined"){
            console.log(_self.options.videoEnd);
            _self.options.videoEnd.call(_self);
        }
    };


    //initial startup function
    _self.init = function(){
        console.log(_self.options);

        //setup video include loading first video, triggering autoplay etc
        _self.setupVideo();

        //load first video
        _self.loadVideo(_self.currentVideo);

        //initialize tracking listener
        // see setupTracking for definition of _self.timeEvents
        // if video is muted don't fire tracking
        var lastTracked = 0;
        _self.video.on("timeupdate", function(event){
            var ratio =  Math.floor((this.currentTime / this.duration) * 100).toFixed(0);

            //flag to disable tracking when muted
            /*if(_self.video.prop("muted") === true){
                return false;
            }*/

            for (var i = 0; i < _self.timeEvents.length; i++) {
                if(ratio >= _self.timeEvents[i].ratio && _self.timeEvents[i].hits === 0){
                    console.log("matches", _self.timeEvents[i].ratio);
                    //_self.fireTracking(_self.timeEvents[i].track);
                    _self.fireTracking( _self.getCurrentTrackingValue(_self.timeEvents[i].name) );
                    _self.timeEvents[i].hits = 1;
                }
            }
        });

        //on video end
        _self.video.get(0).onended = function(e) {
            console.log("video has ended");

            // end / full tracking is fired by the tracking listener - not here

            //if autoplay through videos
            if(_self.options.loopThruPlaylist === true){
                nextVidNum = _self.options.videos.indexOf(_self.currentVideo);
                //check if on the last video first
                if(nextVidNum >= 0 && nextVidNum < _self.options.videos.length - 1){
                    //load up new video and play
                    _self.loadVideo(_self.options.videos[nextVidNum + 1], "autoadvance");
                }else{
                    _self.videoEnd();
                }
            }
            //else show poster and buttons
            else{
                _self.videoEnd();
            }
        };

        //pause video on blur
        if( typeof _self.options.thirdPartyIframe !== "undefined" && _self.options.thirdPartyIframe === true ){
            $(window).blur(function(){
                console.log("page lost focus, video should pause");
                _self.pause();
            });
        }
        else{
            parent.$(window).blur(function(){
                console.log("page lost focus, video should pause");
                _self.pause();
            });
        }
    };
    _self.init();

}
