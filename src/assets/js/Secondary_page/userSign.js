$(function () {
	var sessionData = sessionStorage.getItem("Authentication");
	if (sessionData == null || JSON.parse(sessionData).data == undefined) {
		$(".sign").hide();
		$(".other").hide();
		redirectUrl();
	} else {
		$(".sign").show();
		$(".other").show();
		var paramObj = {
			url: newCmsUrl,
			token: JSON.parse(sessionData).data,
			schedule: {}
		};
		paramObj.schedule = new Schedule({
			el: '#schedule-box',
			nextMonthCb: function (y, m, d) {
				$(".schedule-bd").css("visibility","hidden");
				if (m < 10) {
					m = "0" + m;
				}
				getDateData({
					url: paramObj.url + "task/findUserLandList",
					data: y + "-" + m
				});
			},
			prevMonthCb: function (y, m, d) {
				$(".schedule-bd").css("visibility","hidden");
				if (m < 10) {
					m = "0" + m;
				}
				getDateData({
					url: paramObj.url + "task/findUserLandList",
					data: y + "-" + m
				});
			}
		})

		function getDateData(params) {
			$.ajax({
				url: params.url,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authentication", paramObj.token);
				},
				data: {
					monthDay: params.data
				},
				success: function (result) {
					if (result.resultCode == 200) {
						$(".sign div span")[0].innerHTML = result.resultBody.continuyDay + "天";
						$(".currentDate").attr("title");
						result.resultBody.landDays.forEach(element => {
							$(".currentDate[title=" + element + "]").addClass("signed");
						});
						$(".schedule-bd").css("visibility","visible");
					} else if (result.resultCode == 401 || result.resultCode == 402) {
						redirectUrl();
					}
				},
				error: function (err) {
					console.log(err);
				}
			})
		}

		init();

		function init() {
			var month = new Date().getMonth() + 1;
			if (month < 10) {
				month = "0" + month;
			}
			getDateData({
				url: paramObj.url + "task/findUserLandList",
				data: new Date().getFullYear() + "-" + month
			});
			var sign = onceFun({
					url: paramObj.url + 'task/findUserLandInfo'
				}),
				perfect = onceFun({
					url: paramObj.url + 'task/checkUserDetail'
				});
			if (sign) {
				$(".sign div .btn").removeClass("active");
				$(".sign div .btn")[0].innerHTML = "已签到";
			} else {
				$(".sign div .btn").addClass("active");
				$(".sign div .btn")[0].innerHTML = "签到";
			}
			if (perfect == true) {
				$(".other .other_ul li .btn").addClass("active");
				$(".other .other_ul li .btn").attr("flag", "unfinishe");
				$(".other .other_ul li .btn")[0].innerHTML = "领积分";
			} else if (perfect == false) {
				$(".other .other_ul li .btn").addClass("active");
				$(".other .other_ul li .btn").attr("flag", "tourl");
				$(".other .other_ul li .btn")[0].innerHTML = "去完善";
			} else {
				$(".other .other_ul li .btn").removeClass("active");
				$(".other .other_ul li .btn").attr("flag", "finishe");
				$(".other .other_ul li .btn")[0].innerHTML = "已领取";
			}
		}

		function onceFun(params) {
			var isTrue = false;
			$.ajax({
				url: params.url,
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authentication", paramObj.token);
				},
				success: function (result) {
					if (result.resultCode == 200) {
						if (result.resultBody == "Y") {
							isTrue = true;
						} else if (result.resultBody == "N") {
							isTrue = false;
						} else if (result.resultBody == "FINISHE") {
							isTrue = "FINISHE";
						}
					} else if (result.resultCode == 401 || result.resultCode == 402) {
						redirectUrl();
					}
				},
				error: function (err) {
					console.log(err);
				}
			})
			return isTrue;
		}

		$(".sign div .btn.active").click(function () {
			if ($(".sign div .btn")[0].classList.length > 1) {
				$(".sign div .btn").removeClass("active");
				var month = new Date().getMonth() + 1,
					date = new Date().getDate(),
					toSign = onceFun({
						url: paramObj.url + 'task/insertUserLandInfo'
					});
				if (month < 10) {
					month = "0" + month;
				}
				if (date < 10) {
					date = "0" + date;
				}
				if (toSign) {
					$(".currentDate[title=" + new Date().getFullYear() + "-" + month + "-" + date + "]").addClass("signed");
					$(".sign div .btn")[0].innerHTML = "已签到";
					$(".sign div span")[0].innerHTML = parseInt($(".sign div span")[0].innerHTML.split("")[0]) + 1 + "天";
				} else {
					$(".sign div .btn").addClass("active");
				}
			}
		})

		$(".other .other_ul li .btn.active").click(function () {
			if ($(this).attr("flag") == "unfinishe") {
				$.ajax({
					url: paramObj.url + 'task/insertUserDetail',
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authentication", paramObj.token);
					},
					success: function (result) {
						if (result.resultCode == 200) {
							if (result.resultBody == "Y") {
								$(".other .other_ul li .btn").addClass("active");
								$(".other .other_ul li .btn").attr("flag", "unfinishe");
								$(".other .other_ul li .btn")[0].innerHTML = "领积分";
								$.dialog({
									type: "alert",
									onClickOk: function () {
										return false;
									},
									autoClose: 0,
									contentHtml: `<p style="text-align:center;">领取积分失败</p>`
								});
							} else if (result.resultBody == "FINISHE") {
								$(".other .other_ul li .btn").removeClass("active");
								$(".other .other_ul li .btn").attr("flag", "finishe");
								$(".other .other_ul li .btn")[0].innerHTML = "已领取";
								$.dialog({
									type: "alert",
									onClickOk: function () {
										return false;
									},
									autoClose: 0,
									contentHtml: `<p style="text-align:center;">领取积分成功</p>`
								});
							}
						} else if (result.resultCode == 401 || result.resultCode == 402) {
							redirectUrl();
						}
					},
					error: function (err) {
						console.log(err);
					}
				})
			} else if ($(this).attr("flag") == "tourl") {
				window.location.href = "./info.html";
			}
		})
	}

	$(".header .back").click(function () {
		window.location.href = "./../myself.html";
	})
})