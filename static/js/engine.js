var isRunning = false;
var isMouseDown = false;
var tempListID = null;
var isPlayingListID = null;
var returnToPose = false;
var stopTimeOut;

var currentTab = 'animations';

if(anims_raw == ''){
    // test data for running without Cozmo connected
    anims_raw = 'anim_cozmo_test_01anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01';
    triggers_raw = 'TestTriggerClass01,TestTriggrClass02,TestTriggerClass03,TestTriggerClass04,TestTriggerClass05,TestTriggerClass06,TestTriggerClass07';
    behaviors_raw = 'InCaseYouDidNotNotice,ThisIsTestData:,CozmoIsNotConnected';
}

stringSorting = function (str) {
    var array = str.split(',');
    array.sort();
    return array
};

var animations = {
    name: 'animations',
    list: stringSorting(anims_raw),
    str: '',
    active: 0,
    info: 'A list of animations. Pick an animation from the list and click the play button to animate Cozmo.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};
var triggers = {
    name: 'triggers',
    list: stringSorting(triggers_raw),
    str: '',
    active: 0,
    info: 'A list of animation sets. This differs from the Animation list in that each time you press the same animation from the list, it may play out slightly different. This offers variety: it makes Cozmo seem more alive if you use triggers in your own code.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};
var behaviors = {
    name: 'behaviors',
    list: stringSorting(behaviors_raw),
    str: '',
    active: 0,
    info: 'A list of behaviors. Behaviors represent a task that Cozmo may perform for an indefinite amount of time. Animation Explorer limits active time to 30 seconds. You can abort by pressing the \'stop\' button.<br/><br/>For copying to clipboard:<br/>A.) use the copy button, OR<br/>B.) select a line of text and press Ctrl-C'};

var listArray = [animations, triggers, behaviors];

var listButtons = '' +
    '<div id="list-buttons">' +
        // '<i id="btn-explanation" class="fa fa-question box"></i>' +
        '<i id="btn-copy-clipboard" class="fa fa-copy box"></i>' +
        '<i id="btn-play-stop" class="fa fa-play box"></i>' +
    '</div>';

// sending and receiving json from server
getHttpRequest = function (url, dataSet) {
    if(url != 'toggle_pose' && !isRunning) {
        checkRunning(true);
    }
    var xhr = new XMLHttpRequest();
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

// while running (or not) toggle elements
checkRunning = function (bool) {
    console.log('checkRunning: ' + bool);
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
    var textArea = document.createElement('textarea');
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
    var array = [];
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
    var array = loadArray();

    for(var i = 0; i < array.list.length; i++){
        var elem = $('#li_' + i);
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
    for (var i =0; i < array.list.length; i++) {
        $('#ul-' + array.name).append('<li id="li_' + i + '" class="item-list"><span>' + array.list[i] + '</span></li>');
        var li = $('#li_' + i);
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
            var array = loadArray();
            if(!isRunning) {
                getHttpRequest('play_' + array.name.substr(0, array.name.length - 1), $('#list-buttons').parent().text()); // start specific animation
            }else {
                getHttpRequest('stop', ''); // abort action
                checkRunning(false);
            }
        });
        $('#btn-copy-clipboard').click(function () {
            var textObj = $('#list-buttons').parent().children(":first");
            var str = textObj.text();
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
                var str = $('#list-buttons').parent().text();
                copyTextToClipboard(str);
                $('#list-buttons').parent().append('<div id="copied">copied to clipboard</div>');
                console.log(str);
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
        var str = $('.search').val();
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
    var groupButtons = [];

    for (var j=0; j < animations.list.length; j++){
        var str = animations.list[j];
        var n = str.indexOf("_");
        str = str.substr(n+1);
        n = str.indexOf("_");
        str = str.substr(0, n);

        var match = false;
        for(var k = 0; k < groupButtons.length;k++){
            if(groupButtons[k] == str){
                match = true;
                break
            }
        }
        if(!match && animations.list[j].indexOf('anim_') > -1){
            groupButtons[groupButtons.length] = str;
            $('#search-btns').append('<button id="btn-' + str + '" class="flex-item ui-button ui-widget ui-corner-all">' + str + '</button>');
            $('#btn-' + str).click(function(){
                if (!isRunning) {
                    var str = $(this).text();
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

function createAccordeon() {
    var list = {};
    for (var i = 0; i < listArray.length; i++){
        if (listArray[i].name == currentTab){
            list = listArray[i];
            $('#accordion p').append(list.info);
        }
    }
    $('#accordion').accordion({
        collapsible: true,
        activate: function(event, ui){
            ui.oldHeader.removeClass('box-shadow');
            list.active = $(this).accordion( "option", "active" );
        },
        active: list.active
    });
}

var waitForFinalEvent = (function () {
  var timers = {};
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


/*** INITIALIZATION ***/
$( function () {
    // creating list of cozmo animations (active tab)
    createList(animations);
    createAccordeon();
    createGroupButtons();
    initSearch();

    // enable clipboard copy button
    $('#btn-copy').click(function(){
        copyTextToClipboard($('#mono').text());
        $('#status').text('copied to clipboard');
        $('#mono').effect( 'transfer', {to: '#btn-copy', className: 'ui-effects-transfer'}, 300);
        $(this).css({'background-color': '#05BE00', 'color': '#ffffff'});
    });

    $( "#tabs" ).tabs({
        heightStyle: 'fill',
        beforeActivate: function(event, ui){
            if(isRunning){
                getHttpRequest('stop', ''); // abort action
                checkRunning(false);
            }
            for (var i = 0; i < listArray.length; i++){
                if (listArray[i].name == currentTab){
                    listArray[i].str = $('.search').val();
                }
            }
            var idStr = ui.newTab.attr('aria-controls');
            var oldStr = ui.oldTab.attr('aria-controls')
            var id = Number(idStr.substr(9));
            var name = listArray[id].name;
            currentTab = name;
            $('#' + oldStr).html('');
            $('#' + idStr).html('' +
                '<div class="l-col">' +
                    '<div class="bg-grey">' +
                        '<input class="search" name="search" placeholder="Search" type="text" data-list=".list">' +
                        '<i class="filterclear fa fa-times-circle"></i><i class="filtersubmit fa fa-search"></i>' +
                    '</div>' +
                    '<ul id="ul-' + name + '" class="ul-list"></ul>' +
                '</div>' +
                '<div class="r-col">' +
                    '<div id="accordion">' +
                        '<h3> Info</h3>' +
                        '<div>' +
                            '<p></p>' +
                        '</div>' +
                    '</div>' +
                    '<div id="search-btns">' +
                    '</div>' +
                '</div>'
            );
            setTimeout(function () {
                createAccordeon();
            }, 50);
            createList(listArray[id]);
            if (currentTab == 'animations'){
                createGroupButtons();
            }
            initSearch();
            for (var j = 0; j < listArray.length; j++){
                if (listArray[j].name == currentTab){
                    var str = listArray[j].str;
                    $('.search').val(str);
                    matchCharacters(str);
                }
            }
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

    $(window).resize(function () {
        waitForFinalEvent(function(){
            $('.flex-cstm').outerHeight($(window).height() - $('.flex-cstm').offset().top);
            $('.ul-list').outerHeight($(window).height() - $('.ul-list').offset().top);
        }, 500, 'uniqueID');
    });

    $(window).resize();

});
