$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: newCmsUrl,
            token: JSON.parse(sessionData).data
        };
        $(".main").css("display","flex");
        $(".content .tab li").click(function(){
            $(".content .tab li").removeClass('active');
            $(this).addClass('active');
            if($(this).attr("name") == "reward"){
                $(".reward").show();
                $(".poster").hide();
            }else if($(this).attr("name") == "poster"){
                $(".poster").show();
                $(".reward").hide();
            }
        })
        getImg();
        getNum();
        function getImg(){
            $.ajax({
                url: paramObj.url + "enroll/registerEnrollSearch",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                success: function(res) {
                    if(res.status == 200){
                        $(".poster img").attr("src",res.body.imageUrl);                        
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        }

        function getNum(){
            $.ajax({
                url: paramObj.url + "invite/getUserInviteInfo",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                success: function(res) {
                    if(res.resultCode == 200){
                        $(".reward .title .people")[0].innerText = res.resultBody.ct;
                        $(".reward .title .num")[0].innerText = res.resultBody.gold;
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        }
    }
})