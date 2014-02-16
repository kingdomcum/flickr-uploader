function bindClipboardCopy() {
    var $copy = $("#callback button.copy");
    if (chrome.extension) {
        $copy.click(function () {
            chrome.extension.getBackgroundPage().copy($("#callback input").val());
        });
    } else {
        // @see http://www.steamdev.com/zclip/
        $copy.zclip({
                path: 'lib/ref/ZeroClipboard.swf',
                copy: function () {
                    return $("#callback input").val();
                },
                afterCopy: function () {
                    // 默认会弹个框
                    showCopyTip("已复制.")
                }
            }
        );

        $copy.poshytip({
            content: '点击复制链接.',
            className: 'tip-green',
//            allowTipHover: false,
            showOn: 'none',
            alignTo: 'target',
            alignX: 'inner-left',
            offsetX: 5,
            offsetY: 5
        });

        // http://vadikom.com/demos/poshytip/
        $copy.mouseover(function () {
            showCopyTip('复制链接.');
        });
        $copy.mouseout(function () {
            $copy.poshytip('hideDelayed', 200);
        });

        var $editable = $("#editable");


        $editable.poshytip({
            className: 'tip-green',
            offsetX: -5,
            offsetY: 20,
            followCursor: true,
            slide: false
        });
    }
}

function showCopyTip(mesg) {
    var $copy = $("#callback button.copy");
    $copy.poshytip('update', mesg);
    $copy.poshytip('show');
}

$(document).ready(function () {

    var flickr = $.flickr();
    // FIXME 暂时注释掉，有时没网络很慢！
    /*    var user = flickr.user();
     if (user) {
     $("#userinfo div").text(user.username);
     $("#userinfo img").attr("src", user.icon);
     }
     */
    bindClipboardCopy();

    function getUploadStaticImage(photoid) {
        $("#callback input").val(flickr.photo(photoid));
    }

    function updateUploadStaticImage(ticket) {
        function hit(callback) {
            setTimeout(function () {
                var photoid = flickr.checkTickets(ticket);
                if (!photoid) {
                    hit(callback);
                } else {
                    callback(photoid);
                }
            }, 1000);
        }

        hit(getUploadStaticImage);
    }

    $("#editable").on("paste", function () {
        var ele = event.clipboardData.items;
        if (ele) {
            for (var i = 0; i < ele.length; ++i) {
                if (ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1) {
                    var blob = ele[i].getAsFile();

                    var ticket = $.flickr().upload(blob);
                    updateUploadStaticImage(ticket);

                    window.URL = window.URL || window.webkitURL;
                    var blobUrl = window.URL.createObjectURL(blob);

                    $('<img />').attr('src', blobUrl).css("max-width", "98%").appendTo("#editable");
                }
            }
        }

        // 阻止默认行为
        event.preventDefault();
    });

});