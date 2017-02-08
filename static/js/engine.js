let isRunning = false;
let isMouseDown = false;
let tempListID = null;
let isPlayingListID = null;
let stopTimeOut;
let socket;
let imageInterval, mousedownInterval, mouseKeyCode, animateHTML;

let currentTab = 'animations';

if(anims_raw == ''){
    // test data for running without Cozmo connected
    anims_raw = 'anim_cozmo_test_01anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01';
    triggers_raw = 'TestTriggerClass01,TestTriggrClass02,TestTriggerClass03,TestTriggerClass04,TestTriggerClass05,TestTriggerClass06,TestTriggerClass07';
    behaviors_raw = 'InCaseYouDidNotNotice,ThisIsTestData:,CozmoIsNotConnected';
}

stringSorting = function (str) {
    let array = str.split(',');
    array.sort();
    return array
};

let animations = {
    name: 'animations',
    list: stringSorting(anims_raw),
    str: '',
    active: 0,
    info: 'A list of animations. Pick an animation from the list and click the play button to animate Cozmo.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};
let triggers = {
    name: 'triggers',
    list: stringSorting(triggers_raw),
    str: '',
    active: 0,
    info: 'A list of animation sets. This differs from the Animation list in that each time you press the same animation from the list, it may play out slightly different. This offers letiety: it makes Cozmo seem more alive if you use triggers in your own code.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};
let behaviors = {
    name: 'behaviors',
    list: stringSorting(behaviors_raw),
    str: '',
    active: 0,
    info: 'A list of behaviors. Behaviors represent a task that Cozmo may perform for an indefinite amount of time. Animation Explorer limits active time to 30 seconds. You can abort by pressing the \'stop\' button.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};

let listArray = [animations, triggers, behaviors];

let listButtons = '' +
    '<div id="list-buttons">' +
        // '<i id="btn-explanation" class="fa fa-question box"></i>' +
        '<i id="btn-copy-clipboard" class="fa fa-copy box"></i>' +
        '<i id="btn-play-stop" class="fa fa-play box"></i>' +
    '</div>';

// sending and receiving json from server
getHttpRequest = function (url, dataSet)
{
    if(url != 'toggle_pose' && !isRunning) {
        checkRunning(true);
    }
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if(isRunning) {
                if (currentTab == 'behaviors'){
                    stopTimeOut = setTimeout(function(){
                            if(isRunning && currentTab == 'behaviors') {
                                console.log('stopTimeOut triggered');
                                getHttpRequest('stop', '');
                                checkRunning(false);
                            }
                        },
                        30000 // run behavior for 30 seconds
                    );
                } else {
                    checkRunning(false);
                }
            }
        }
    };
    xhr.open('POST', url, true);
    xhr.send(JSON.stringify(dataSet));
};

function postHttpRequest(url, dataSet)
{
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.send( JSON.stringify( dataSet ) );
}

// while running (or not) toggle elements
checkRunning = function (bool) {
    isRunning = bool;

    if (bool){
        $('.item-list').addClass('greyed-out');
        $('#list-buttons').parent().addClass('bg-playing');
        $('#c-play').show();
        $('#c-eyes').hide();
        $('#btn-play-stop').addClass('red');
        if(currentTab == 'behaviors') {
            $('#btn-play-stop').addClass('fa-stop');
        } else {
            $('#btn-play-stop').hide();
        }
        $('.bg-just-played').removeClass('bg-just-played');
        isPlayingListID = $('#list-buttons').parent();
    } else {
        if(isPlayingListID != null) {
            isPlayingListID.toggleClass('bg-playing bg-just-played');
            isPlayingListID = null;
        }
        $('.item-list').removeClass('greyed-out');
        $('#c-play').hide();
        $('#c-eyes').show();
        if(currentTab == 'behaviors') {
            $('#btn-play-stop').removeClass('fa-stop');
        } else {
            $('#btn-play-stop').show();
        }
        if($('#list-buttons').length && $('#list-buttons').parent().is(':hover')){
            $('#btn-play-stop').removeClass('red');
        } else {
            $('#list-buttons').remove();
            if(tempListID != null){
                createListButtons(tempListID);
            }
        }
    }
};

// store text value in OS clipboard
function copyTextToClipboard(text) {
    let textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.log('ERROR: unable to copy text to clipboard');
    }

    document.body.removeChild(textArea);
}

function loadArray(){
    let array = [];
    if (currentTab == 'animations'){
        array = animations;
    } else if (currentTab == 'triggers'){
        array = triggers;
    } else if (currentTab == 'behaviors'){
        array = behaviors;
    }
    return array
}

// hide list item if string from search box does not match list item text
function matchCharacters(str){
    let array = loadArray();

    for(let i = 0; i < array.list.length; i++){
        let elem = $('#li_' + i);
        if (array.list[i].toLowerCase().indexOf(str.toLowerCase()) != -1){
            elem.show();
        } else {
            elem.hide();
        }
    }
    console.log('matching character(s): ' + str);
    showClear(str);
}

// show clear button when search box value is not empty
function showClear(str){
    if(str == ''){
        $('.filterclear').css('visibility', 'hidden');
        $('.filtersubmit').css('visibility', 'visible');
    } else {
        $('.filterclear').css('visibility', 'visible');
        $('.filtersubmit').css('visibility', 'hidden');
    }
}

// create list
function createList(array){
    for (let i =0; i < array.list.length; i++) {
        $('#ul-animations').append('<li id="li_' + i + '" class="item-list"><span>' + array.list[i] + '</span></li>');
        let li = $('#li_' + i);
        li.mouseenter(function () {
            if(!isRunning) {
                if ($('#list-buttons').length) {
                    $('#list-buttons').remove();
                }
                tempListID = $(this);
                createListButtons($(this));
            }
        });
        li.mouseleave(function () {
            tempListID = null;
            if($('#list-buttons').length && !isRunning) {
                $('#list-buttons').remove();
            }
        })
    }
}

// create buttons for list item
function createListButtons(item){
    if(!isRunning && !isMouseDown) {
        item.append(listButtons);
        $('#btn-play-stop').click(function () {
            let array = loadArray();
            if(!isRunning) {
                getHttpRequest('play_' + array.name.substr(0, array.name.length - 1), $('#list-buttons').parent().text()); // start specific animation
            }else {
                getHttpRequest('stop', ''); // abort action
                checkRunning(false);
            }
        });
        $('#btn-copy-clipboard').click(function () {
            let textObj = $('#list-buttons').parent().children(":first");
            let str = textObj.text();
            textObj.text('copied to clipboard');
            //parent.mouseenter(); // this behaves quirky
            copyTextToClipboard(str);
            console.log(str);
            setTimeout(function() {
                textObj.text(str);
                //parent.mouseenter(); // this behaves quirky
            }, 600);
        });
        $('#btn-explanation').click(function () {
/*
            if (!$('#copied').length) {
                let str = $('#list-buttons').parent().text();
                copyTextToClipboard(str);
                $('#list-buttons').parent().append('<div id="copied">copied to clipboard</div>');
                console.event-content(str);
                setTimeout(function () {
                    $('#copied').remove();
                }, 600);
            }
*/
        })
    }
}

function initSearch() {
    // evaluate search input value after every entered key
    $('.search').bind('input', function (){
        let str = $('.search').val();
        matchCharacters(str);
    });

    // clear search box value
    $('.filterclear').click(function (){
        $('.search').val('');
        matchCharacters('');
    });
}

function createGroupButtons() {
    // create group buttons
    let groupButtons = [];

    for (let j=0; j < animations.list.length; j++){
        let str = animations.list[j];
        let n = str.indexOf("_");
        str = str.substr(n+1);
        n = str.indexOf("_");
        str = str.substr(0, n);

        let match = false;
        for(let k = 0; k < groupButtons.length;k++){
            if(groupButtons[k] == str){
                match = true;
                break
            }
        }
        if(!match && animations.list[j].indexOf('anim_') > -1){
            groupButtons[groupButtons.length] = str;
            $('#group-content').append('<button id="btn-' + str + '" class="flex-item ui-button ui-widget ui-corner-all">' + str + '</button>');
            $('#btn-' + str).click(function(){
                if (!isRunning) {
                    let str = $(this).text();
                    if ($('.search').val() == str) {
                        str = '';
                    }
                    $('.search').val(str);
                    matchCharacters(str);
                }
            })
        }
    }
}

let waitForFinalEvent = (function () {
  let timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = 'Do not call this twice without a uniqueId';
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

function updateImage() {
    // Note: Firefox ignores the no_store and still caches, needs the "?UID" suffix to fool it
    document.getElementById("cozmoImageId").src="cozmoImage?" + (new Date()).getTime();
}

function handleKeyActivity (e, actionType)
{
    let keyCode  = (e.keyCode ? e.keyCode : e.which);
    let hasShift = (e.shiftKey ? 1 : 0);
    let hasCtrl  = (e.ctrlKey  ? 1 : 0);
    let hasAlt   = (e.altKey   ? 1 : 0);

    let bID = [0, ''];
    if (keyCode == 87) { bID = [0, '#ctrl_btn_W']} // W
    if (keyCode == 83) { bID = [0, '#ctrl_btn_S']} // S
    if (keyCode == 65) { bID = [0, '#ctrl_btn_A']} // A
    if (keyCode == 68) { bID = [0, '#ctrl_btn_D']} // D
    if (keyCode == 81) { bID = [0, '#ctrl_btn_Q']} // Q
    if (keyCode == 69) { bID = [0, '#ctrl_btn_E']} // E
    if (keyCode == 82) { bID = [0, '#ctrl_btn_R']} // R
    if (keyCode == 70) { bID = [0, '#ctrl_btn_F']} // F
    if (keyCode == 16) { bID = [1, '#ctrl_state_SHIFT']} // SHIFT
    if (keyCode == 18) { bID = [1, '#ctrl_state_ALT']}   // ALT

    if (actionType=="keyup")
    {
        if(bID[0] == 0) {
            $(bID[1]).removeClass('control-button-active');
        } else {
            $(bID[1]).removeClass('control-state-active');
        }

    } else {
        if(bID[0] == 0) {
            $(bID[1]).addClass('control-button-active');
        } else {
            $(bID[1]).addClass('control-state-active');
        }
    }
    postHttpRequest(actionType, {keyCode, hasShift, hasCtrl, hasAlt})
}

let initControlButtons = function(){
    let controlButtons = [
        ['W', 124, 159], // forward
        ['S', 124, 227], // back
        ['A', 70, 193],  // left
        ['D', 178, 193], // right
        ['Q', 17, 31],   // head up
        ['E', 71, 31],   // head down
        ['R', 177, 31],  // arm up
        ['F', 231, 31]   // arm down
    ];

    let controlStates = [
        ['SHIFT', 8, 267],
        ['ALT', 214, 267]
    ];

    for (let i = 0; i < controlButtons.length; i++){
        let bID = 'ctrl_btn_' + controlButtons[i][0];
        $('#controls-content').append('<div id="'+ bID + '" class="control-button">' + controlButtons[i][0] + '</div>');
        let btn = $('#' + bID);
        btn.css({
            left: controlButtons[i][1],
            top: controlButtons[i][2]
        });
        btn.mousedown(function(){
            mouseKeyCode = $(this).attr('id').charCodeAt(9);
            $(this).addClass('control-button-active');
/*
            mousedownInterval = setInterval(function(){
                console.event-content(mouseKeyCode);
                postHttpRequest('keydown', {keyCode: mouseKeyCode, hasShift:0, hasCtrl:0, hasAlt:0})
            }, 100);
*/
        });
        btn.mouseup(function(){
            clearInterval(mousedownInterval);
            $(this).removeClass('control-button-active');
        });
        btn.mouseleave(function () {
            clearInterval(mousedownInterval);
            $(this).removeClass('control-button-active');
        });
    }
    for (let j=0; j < controlStates.length; j++){
        let bID = 'ctrl_state_' + controlStates[j][0];
        $('#controls-content').append('<div id="'+ bID + '" class="control-state">' + controlStates[j][0] + '</div>');
        let state = $('#' + bID);
        state.css({
            left: controlStates[j][1],
            top: controlStates[j][2]
        });
    }
};


/*** INITIALIZATION ***/
$( function () {

    let initAnimationList = function(fragment, listType){
        fragment.load('../static/includes/animate.html', function(){

            for(let i = 0; i < listArray.length; i++){
                if(listArray[i].name == listType){
                    createList(listArray[i]);
                    if(listType == 'animations'){
                        createGroupButtons();
                        $('#group-btns').show();
                    } else $('#group-btns').hide();
                    initSearch();
                    let str = listArray[i].str;
                    $('.search').val(str);
                    matchCharacters(str);
                }
            }

            $('#group-header').click(function () {
                if ($('#group-content').hasClass('hidden')) {
                    $('#group-content').removeClass('hidden');
                    $('#group-header i').switchClass('fa-plus-square-o', 'fa-minus-square-o');
                } else {
                    $('#group-content').addClass('hidden');
                    $('#group-header i').switchClass('fa-minus-square-o', 'fa-plus-square-o');
                }
            });

        });
    };

    // creating list of cozmo animations (active tab)
    animateHTML = document.querySelector('link[rel="import"]');
    initAnimationList($('#fragment-0'), 'animations');

    // enable clipboard copy button
    $('#btn-copy').click(function(){
        copyTextToClipboard($('#mono').text());
        $('#status').text('copied to clipboard');
        $('#mono').effect( 'transfer', {to: '#btn-copy', className: 'ui-effects-transfer'}, 300);
        $(this).css({'background-color': '#05BE00', 'color': '#ffffff'});
    });

    $( "#tabs" ).tabs({
        heightStyle: 'content',
        beforeActivate: function(event, ui){
            if(isRunning){
                getHttpRequest('stop', ''); // abort action
                checkRunning(false);
            }
            for (let i = 0; i < listArray.length; i++){
                if (listArray[i].name == currentTab){
                    listArray[i].str = $('.search').val();
                }
            }
            let idStr = ui.newTab.attr('aria-controls');
            let oldStr = ui.oldTab.attr('aria-controls');
            let id = Number(idStr.substr(9));
            let name = listArray[id].name;
            currentTab = name;
            $('#' + oldStr).html('');
            initAnimationList($('#' + idStr), currentTab);
        },
        classes: {
            'ui-tabs-nav': 'tabs-nav',
            'ui-tabs': 'tabs'
        }
    });

    // global mousedown detection: to prevent list-buttons from being created while mouse is pressed
    $('body').mousedown(function () {
        isMouseDown = true;
    });

    $('body').mouseup(function () {
        isMouseDown = false;
    });

    $('#tablist').removeClass('ui-corner-all');

    $('#checkbox-1').bind('change', function(){
        getHttpRequest('toggle_pose', '');
    });

    // event monitor timestamp toggle
    $('#checkbox-2').prop( "checked", true );
    $('#checkbox-2').bind('change', function(){
        if($(this).is(':checked')) {
            $('#event-content li span').removeClass('hidden');
        } else {
            $('#event-content li span').addClass('hidden');
        }
    });

    $('#event-header').click(function () {
        if ($('#event-content').hasClass('hidden')) {
            $('#event-content').removeClass('hidden');
            $('#event-header i').switchClass('fa-plus-square-o', 'fa-minus-square-o');
        } else {
            $('#event-content').addClass('hidden');
            $('#event-header i').switchClass('fa-minus-square-o', 'fa-plus-square-o');
        }
    });

    initControlButtons();
    $('#controls-header').click(function () {
        if ($('#controls-content').hasClass('hidden')) {
            $('#controls-content').removeClass('hidden');
            $('#controls-header i').switchClass('fa-plus-square-o', 'fa-minus-square-o');
        } else {
            $('#controls-content').addClass('hidden');
            $('#controls-header i').switchClass('fa-minus-square-o', 'fa-plus-square-o');
        }
    });

    $('#viewer-header').click(function () {
        let name = $(this).attr('id');
        let len = name.length;
        let id = name.substring(len - 7, len);
        console.log(id);
        if ($('#viewer-content').hasClass('hidden')) {
            $('#viewer-content').removeClass('hidden');
            $('#viewer-header i').switchClass('fa-plus-square-o', 'fa-minus-square-o');
            $('#viewer').addClass('viewer-height');
            imageInterval = setInterval(updateImage, 90);
        } else {
            $('#viewer-content').addClass('hidden');
            $('#viewer-header i').switchClass('fa-minus-square-o', 'fa-plus-square-o');
            $('#viewer').removeClass('viewer-height');
            clearInterval(imageInterval);
        }
    });
    imageInterval = setInterval(updateImage, 90);

    // viewer debug toggle
    $('#checkbox-5').prop( "checked", true );
    $('#checkbox-5').bind('change', function(){
        let debug_annotation_state;
        if($(this).is(':checked')) {
            debug_annotation_state = 2;
        } else {
            debug_annotation_state = 1;
        }
        postHttpRequest("setAreDebugAnnotationsEnabled", {areDebugAnnotationsEnabled: debug_annotation_state})
    });

    if(hasSocketIO == 'True') {
        init_websocket();
    } else {
        $('#event-content').append('flask-socketio not installed, event monitoring only visible on python console or terminal');
    }

    document.addEventListener("keydown", function(e) { handleKeyActivity(e, "keydown") } );
    document.addEventListener("keyup",   function(e) { handleKeyActivity(e, "keyup") } );
});
