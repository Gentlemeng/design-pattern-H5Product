$(function () {
    var paramObj = {
        newCmsUrl: newCmsUrl,
        carouselId: parseURL(window.location.href).id,
        mescroll: {}
    };
    getContent();

    function getContent() {
        $(".content").empty();
        $.ajax({
            url: paramObj.newCmsUrl + "carousel/find",
            data: {
                carouselId: paramObj.carouselId
            },
            success: function (result) {
                $(".header").css("background-image", "url(" + result.imgUrl + ")");
                if(result.imgTitle != ""){       
                    $(".title").show(); 
                    $(".title")[0].innerHTML = result.imgTitle;
                }
                $(".content").append(result.imgContent);
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    $(".backBtn .back").click(function () {
        window.location.href = "./../forecast.html";
    })
})