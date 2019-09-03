var sessionData = sessionStorage.getItem("Authentication");
$(function () {
	if (sessionData != null && JSON.parse(sessionData).data != undefined) {
		var token = JSON.parse(sessionData).data;
		$.ajax({
			url: newCmsUrl + "IntegrateUserDetail/UserDetail",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authentication", token);
			},
			success: function (result) {
				if (result.status == 200) {
					$(".my_head .photo").css("background-image", "url(" + result.body.userHeadImage + ")");
					$(".my_banner .label").html(result.body.userNickName);
				}
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
});

$(".photo").click(function () {
	if (sessionData == null || JSON.parse(sessionData).data == undefined) {
		window.location.href = commonParamObj.redirectUrl;
	}
});

$(".my_content a").click(function () {
	if (sessionData == null || JSON.parse(sessionData).data == undefined) {
		redirectUrl();
		return false;
	} else {
        if($(this).hasClass('link_from_myself')){
            sessionStorage.setItem("productSource",'./../myself.html')
        }
		return true;
	}
})