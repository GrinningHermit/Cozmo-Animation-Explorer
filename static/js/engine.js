var groupButtons = [];

var isRunning = false;

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

// var animations = stringSorting(anims_raw);
// var triggers = stringSorting(triggers_raw);
// var behaviors = stringSorting(behaviors_raw);

var animations = {name: 'animations', list: stringSorting(anims_raw)};
var triggers = {name: 'triggers', list: stringSorting(triggers_raw)};
var behaviors = {name: 'behaviors', list: stringSorting(behaviors_raw)};

var listArray = [animations, triggers, behaviors];

// sending and receiving json from server
getHttpRequest = function (url, dataSet) {
    checkRunning(true);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            checkRunning(false);
        }
    };
    xhr.open('POST', url, true);
    xhr.send(JSON.stringify(dataSet));
};

// while running (or not) toggle elements
checkRunning = function (bool) {
    isRunning = bool;
    if (bool){
        $('ul').css({'opacity': 0.5});
        $('#c-play').show();
        $('#c-eyes').hide();
    } else {
        $('ul').css({'opacity': 1});
        $('#c-play').hide();
        $('#c-eyes').show();
        $('#status').text('stopped');
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

// hide list item if string from search box does not match list item text
function matchCharacters(str){
    var array = [];
    if (currentTab == 'animations'){
        array = animations.list;
    } else if (currentTab == 'triggers'){
        array = triggers.list;
    } else if (currentTab == 'behaviors'){
        array = behaviors.list;
    }
    for(var i = 0; i < array.length; i++){
        var elem = $('#li_' + i);
        if (array[i].toLowerCase().indexOf(str.toLowerCase()) != -1){
            elem.show();
        } else if(elem.is(":visible")){
            elem.hide();
        }
    }
    console.log(str);
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
        $('#ul-' + array.name).append('<li id="li_' + i + '" class="item-list">' + array.list[i] + '</li>');
        $('#li_' + i).click(function () {
            getHttpRequest('play_' + array.name.substr(0, array.name.length-1), $(this).text()); // start specific animation
            var str = $(this).text();
            $('#mono').text(str);
            $('#status').text('is playing');
            $('#btn-copy').css({'background-color': '#ffffff', 'color': '#000000'});
            copyTextToClipboard(str);
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

/*** INITIALIZATION ***/
$( function () {
    $('#content').css({height: ($(window).height() - 74) + 'px'});
    // creating list of cozmo animations (active tab)
    createList(animations);

    // create group buttons
    for (var j=0; j < animations.length; j++){
        var str = animations[j];
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
        if(!match && animations[j].indexOf('anim_') > -1){
            groupButtons[groupButtons.length] = str;
            $('.r-col').append('<button id="btn-' + str + '" class="flex-item ui-button ui-widget ui-corner-all">' + str + '</button>');
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

    initSearch();

    // enable clipboard copy button
    $('#btn-copy').click(function(){
        copyTextToClipboard($('#mono').text());
        $('#status').text('copied to clipboard');
        $('#mono').effect( 'transfer', {to: '#btn-copy', className: 'ui-effects-transfer'}, 300);
        $(this).css({'background-color': '#05BE00', 'color': '#ffffff'});
    });

    $('#btn-animations').click(function () {
        if (currentTab != 'animation'){
            currentTab = 'animation';
            $('ul').empty();
            createList(animations);
            $(this).css({'background-color': '#ccc000'});
            $('#btn-triggers').css({'background-color': '#cccccc'});
            $('#btn-behaviors').css({'background-color': '#cccccc'});
        }
    });
    $('#btn-animations').css({'background-color': '#ccc000'});

    $('#btn-triggers').click(function () {
        if (currentTab != 'trigger'){
            currentTab = 'trigger';
            $('ul').empty();
            createList(triggers);
            $(this).css({'background-color': '#ccc000'});
            $('#btn-animations').css({'background-color': '#cccccc'});
            $('#btn-behaviors').css({'background-color': '#cccccc'});
        }
    });

    $('#btn-behaviors').click(function () {
        if (currentTab != 'behavior'){
            currentTab = 'behavior';
            $('ul').empty();
            createList(behaviors);
            $(this).css({'background-color': '#ccc000'});
            $('#btn-animations').css({'background-color': '#cccccc'});
            $('#btn-triggers').css({'background-color': '#cccccc'});
        }
    });

    $( "#tabs" ).tabs({
        heightStyle: 'fill',
        beforeActivate: function(event, ui){
            var str = ui.newTab.attr('aria-controls');
            var oldStr = ui.oldTab.attr('aria-controls')
            var id = Number(str.substr(9));
            var name = listArray[id].name;
            currentTab = name;
            $('#' + oldStr).html('');
            $('#' + str).html('' +
                '<div class="l-col">' +
                    '<div class="bg-grey">' +
                        '<input class="search" name="search" placeholder="Search" type="text" data-list=".list">' +
                        '<i class="filterclear fa fa-times-circle"></i><i class="filtersubmit fa fa-search"></i>' +
                    '</div>' +
                    '<ul id="ul-' + name + '" class="ul-list"></ul>' +
                '</div>' +
                '<div class="r-col"></div>');
            createList(listArray[id]);
            initSearch();
            console.log(id);
        },
        activate: function(event, ui){
            $('.ul-list').height($(window).height() - $('.ul-list').offset().top - 4);
            //console.log($(this).tabs( 'option', 'active' ))
        }
    });

    $('.ul-list').height($(window).height() - $('.ul-list').offset().top - 4);

});
