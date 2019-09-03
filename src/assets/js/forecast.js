$(function () {
  var paramObj = {
    indexUrl: indexUrl,
    newCmsUrl: newCmsUrl,
    energyChart: '',
    barColor: [],
    menu: sessionStorage.getItem("menu"),
    classArr: []
  }
  getDom();
  getPic();
  // 构建dom元素
  function getDom() {
    $.ajax({
      url: paramObj.indexUrl + "indexData",
      async: false,
      success: function (res) {
        if (res.body.data.length != 0) {

          var result = res.body.data[0].children,
            lidom;
          paramObj.classArr = [];
          for (var i = 0; i < result.length; i++) {
            var sectionDom = "",
              contentDom = "";
            paramObj.classArr.push(result[i].kclass);
            if (i == 0) {
              lidom = "<li><a class='liactive' href='javascript:;' name='" + result[i].kclass + "'>" + result[i].name + "</a></li>";
            } else {
              lidom += "<li><a href='javascript:;' name='" + result[i].kclass + "'>" + result[i].name + "</a></li>";
            }
            for (var a = 0; a < result[i].childrenData.length; a++) {
              for (var z = 0; z < result[i].childrenData[a].length; z++) {
                let domflex = "row",
                  boxWidth = "40%",
                  href = "javascript:;",
                  color = "to left top, #" + result[i].childrenData[a][z].indexEndColor + ", #" + result[i].childrenData[a][z].indexStartColor;
                if (result[i].childrenData[a].length > 2) {
                  domflex = "column";
                }
                if (result[i].childrenData[a].length > 1) {
                  boxWidth = "100%";
                }
                if (result[i].childrenData[a][z].useFlag == 1) {
                  href = "./pages/forecast_detail.html?indexId=" + result[i].childrenData[a][z].indexId;
                  if (result[i].childrenData[a][z].indexId.substr(0, 4) == "ZZDN") {
                    href = "./pages/energy_home.html?indexId=" + result[i].childrenData[a][z].indexId;
                  }
                }
                contentDom += `<a class="one" href="${href}" style="background: -webkit-linear-gradient(${color}); background: -o-linear-gradient(${color});background: -moz-linear-gradient(${color});background: linear-gradient(${color}); width:${100 / (result[i].childrenData[a].length)}%" index="${result[i].childrenData[a][z].indexId}">
                                <div class="box" style="flex-direction:${domflex};width:${boxWidth}">
                                    <div class="domImg" >
                                        <img class="dom_img" src="${result[i].childrenData[a][z].indexImageUrl}">
                                    </div>
                                    <div class="title">${result[i].childrenData[a][z].name}</div>
                                </div>
                            </a>`
              }
            }
            sectionDom = "<section class='" + result[i].kclass + "'>" + contentDom + "</section>";
            $(".forecast_content").append(sectionDom);
          }
          paramObj.classArr.forEach(function (v, index) {
            $(".forecast_content ." + v).css({
              "flex-wrap": "wrap",
              "display": "none"
            });
            if (index == 0) {
              $(".forecast_content ." + v).css({
                "display": "flex"
              });
            }
          })
          $(".tabSelect .tabs").append(lidom);
          $(".forecast_title .tabSelect ul li").css("width", 100 / $(".tabSelect .tabs li").length + "%");
          // tab切换
          $('.tabs li').each(function () {
            $(this).click(function () {
              $('.tabs li a').removeClass('liactive');
              $(this).children().addClass('liactive');
              var name = $(this).children().attr("name");
              sessionStorage.removeItem("menu");
              sessionStorage.setItem("menu", name);
              var active = $.inArray(name, paramObj.classArr);
              paramObj.classArr.forEach(function (v, index) {
                $(".forecast_content ." + v).hide();
                if (index == active) {
                  $(".forecast_content ." + v).css({
                    "display": "flex"
                  });
                }
              })
              // alert($(".scroller").height());
            })
          })
        }
      },
      error: function (err) {
        console.log(err);
      }
    })
  }
  // 设置菜单激活状态
  if (paramObj.menu != null) {
    $('.tabs li a').removeClass('liactive');
    $('.tabs li a[name="' + paramObj.menu + '"]').addClass('liactive');
    var active = $.inArray(paramObj.menu, paramObj.classArr);
    paramObj.classArr.forEach(function (v, index) {
      $(".forecast_content ." + v).hide();
      if (index == active) {
        $(".forecast_content ." + v).css({
          "display": "flex"
        });
      }
    })
  }
  // 获取轮播图
  function getPic() {
    $.ajax({
      url: paramObj.newCmsUrl + "carousel/list",
      success: function (res) {
        var images = res,
          imgdom = "";
        for (var j = 0; j < images.length; j++) {
          imgdom += '<div class="swiper-slide forecastImg forecast_img' + j + '" imgId=' + images[j].id + ' style="background-image: url(' + images[j].imgUrl + ');background-position: center;background-size: cover;"></div>';
        }
        $(".swiper-wrapper").append(imgdom);
        // 轮播图
        new Swiper('.swiper-container', {
          autoplay: 2500,
          autoplayDisableOnInteraction: false,
          pagination: '.swiper-pagination'
        })
        $(".forecastImg").click(function () {
          window.location.href = './pages/forecast_pic.html?id=' + $(this).attr("imgId");
        })
      },
      error: function (err) {
        console.log(err);
      }
    })
  }
  /* 签到按钮 */
  $(".sign").click(function () {
    //     var sessionData = sessionStorage.getItem("Authentication");
    //     if (sessionData == null || JSON.parse(sessionData).data == undefined) {
    //         redirectUrl();
    //     } else {
    //         window.location.href = './pages/userSign.html';
    //     }
  })

  $(".invite .btn").click(function () {
    window.location.href = './pages/invite.html';
  })
  $(".invite .closeBtn").click(function () {
    $(".invite_bg").hide();
  })
})