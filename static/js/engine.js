var groupButtons = [];

var isRunning = false;

if(anims_raw == ''){
    anims_raw = 'anim_cozmo_test_01anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01,anim_cozmo_test_01,anim_cozmo_test_02,anim_cozmo_test_03,anim_cozmo_test_04,anim_cozmo_test_05,anim_more_test_01,anim_more_test_02,anim_more_test_03,anim_more_test_04,anim_more_test_01';
} else {
    anims_raw = anims_raw.substr(0, anims_raw.length-1);
}

var anims = anims_raw.split(',');
anims.sort();

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
    for(var i = 0; i < anims.length; i++){
        var elem = $('#anim_' + i);
        if (anims[i].indexOf(str) == -1 ){
            elem.hide();
        } else if(!elem.is(":visible")){
            elem.show();
        }
    }
    showClear(str);
}

// show clear button when search box value is not empty
function showClear(str){
    if(str == ''){
        $('#filterclear').css('visibility', 'hidden');
        $('#filtersubmit').css('visibility', 'visible');
    } else {
        $('#filterclear').css('visibility', 'visible');
        $('#filtersubmit').css('visibility', 'hidden');
    }
}

/*** INITIALIZATION ***/
$( function () {
    $('ul').css({height: ($(window).height() - 74) + 'px'});
    // creating list of cozmo animations
    for (var i =0; i < anims.length; i++) {
        $('ul').append('<li id="anim_' + i + '">' + anims[i] + '</li>');
        $('#anim_' + i).click(function () {
            getHttpRequest('play_animation', $(this).text()); // start specific animation
            var str = $(this).text();
            $('#mono').text(str);
            $('#status').text('is playing');
            $('#btn-copy').css({'background-color': '#ffffff', 'color': '#000000'});
            copyTextToClipboard(str);
        })
    }

    // create group buttons
    for (var j=0; j < anims.length; j++){
        var str = anims[j];
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
        if(!match && anims[j].indexOf('anim_') > -1){
            groupButtons[groupButtons.length] = str;
            $('#l-col').append('<button id="btn-' + str + '" class="flex-item ui-button ui-widget ui-corner-all">' + str + '</button>');
            $('#btn-' + str).click(function(){
                if (!isRunning) {
                    var str = $(this).text();
                    if ($('#search').val() == str) {
                        str = '';
                    }
                    $('#search').val(str);
                    matchCharacters(str);
                }
            })
        }
    }

    // evaluate search input value after every entered key
    $('#search').bind('input', function (){
        var str = $('#search').val();
        matchCharacters(str);
    });

    // clear search box value
    $('#filterclear').click(function (){
        $('#search').val('');
        matchCharacters('');
    });

    // enable clipboard copy button
    $('#btn-copy').click(function(){
        copyTextToClipboard($('#mono').text());
        $('#status').text('copied to clipboard');
        $('#mono').effect( 'transfer', {to: '#btn-copy', className: 'ui-effects-transfer'}, 300);
        $(this).css({'background-color': '#05BE00', 'color': '#ffffff'});
    });

});
