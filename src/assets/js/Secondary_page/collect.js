$(function () {
  var sessionData = sessionStorage.getItem("Authentication");
  if (sessionData == null || JSON.parse(sessionData).data == undefined) {
    redirectUrl();
  } else {
    var paramObj = {
      url: newCmsUrl,
      token: JSON.parse(sessionData).data,
      mescroll: {}
    }
    // tab切换
    $('.tabs li').each(function () {
      $(this).click(function () {
        $('.tabs li a').removeClass('liactive');
        $(this).children().addClass('liactive');
        var name = $(this).children().attr("name");
        if (name == "info") {
          $(".info_ul").empty();
          $(".info_ul").show();
          $(".index_ul").hide();
          $(".expert_ul").hide();
          // 资讯列表
          paramObj.mescroll.destroy();
          paramObj.mescroll = new MeScroll("main", {
            up: {
              clearEmptyId: "info_ul",
              page: {
                num: 0,
                size: 5,
                flag: name,
                className: '.info_ul',
                url: paramObj.url + "newsCollention/findNewsCollectionByUser"
              },
              callback: upCallBack,
              empty: {
                tip: "暂无更多数据",
              },
              htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
              loadFull: {
                use: true,
                delay: 0
              }
            },
            down: {
              use: false
            }
          });
        } else if (name == "index") {
          $(".index_ul").empty();
          $(".info_ul").hide();
          $(".index_ul").show();
          $(".expert_ul").hide();
          // 指标列表
          paramObj.mescroll.destroy();
          paramObj.mescroll = new MeScroll("main", {
            up: {
              clearEmptyId: "index_ul",
              page: {
                num: 0,
                size: 5,
                flag: name,
                className: '.index_ul',
                url: paramObj.url + "indexCollention/findIndexCollectionByUser"
              },
              callback: upCallBack,
              empty: {
                tip: "暂无更多数据",
              },
              htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
              loadFull: {
                use: true,
                delay: 0
              }
            },
            down: {
              use: false
            }
          });
        } else if (name == "expert") {
          $(".expert_ul").empty();
          $(".info_ul").hide();
          $(".expert_ul").show();
          $(".index_ul").hide();
          // 专家列表
          paramObj.mescroll.destroy();
          paramObj.mescroll = new MeScroll("main", {
            up: {
              clearEmptyId: "expert_ul",
              page: {
                num: 0,
                size: 5,
                flag: name,
                className: '.expert_ul',
                url: paramObj.url + "expertCollection/findExpertListByuserId"
              },
              callback: upCallBack,
              empty: {
                tip: "暂无更多数据",
              },
              htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
              loadFull: {
                use: true,
                delay: 0
              }
            },
            down: {
              use: false
            }
          });
        }
      })
    })
    if (document.referrer.indexOf("forecast_index") != -1) {
      $(".index_ul").empty();
      $(".index_ul").show();
      $(".info_ul").hide();
      $(".expert_ul").hide();
      $('.tabs li a').removeClass('liactive');
      $(".tabs li a[name='index']").addClass('liactive');
      paramObj.mescroll = new MeScroll("main", {
        up: {
          clearEmptyId: "index_ul",
          page: {
            num: 0,
            size: 5,
            flag: "index",
            className: '.index_ul',
            url: paramObj.url + "indexCollention/findIndexCollectionByUser"
          },
          callback: upCallBack,
          empty: {
            tip: "暂无更多数据",
          },
          htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
          loadFull: {
            use: true,
            delay: 0
          }
        },
        down: {
          use: false
        }
      });
    } else if (document.referrer.indexOf("expert_detail") != -1) {
      $(".expert_ul").empty();
      $(".expert_ul").show();
      $(".index_ul").hide();
      $(".info_ul").hide();
      $('.tabs li a').removeClass('liactive');
      $(".tabs li a[name='expert']").addClass('liactive');
      paramObj.mescroll = new MeScroll("main", {
        up: {
          clearEmptyId: "expert_ul",
          page: {
            num: 0,
            size: 5,
            flag: "expert",
            className: '.expert_ul',
            url: paramObj.url + "expertCollection/findExpertListByuserId"
          },
          callback: upCallBack,
          empty: {
            tip: "暂无更多数据",
          },
          htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
          loadFull: {
            use: true,
            delay: 0
          }
        },
        down: {
          use: false
        }
      });
    } else {
      $(".info_ul").empty();
      $(".info_ul").show();
      $(".index_ul").hide();
      $(".expert_ul").hide();
      $('.tabs li a').removeClass('liactive');
      $(".tabs li a[name='info']").addClass('liactive');
      paramObj.mescroll = new MeScroll("main", {
        up: {
          clearEmptyId: "info_ul",
          page: {
            num: 0,
            size: 5,
            flag: "info",
            className: '.info_ul',
            url: paramObj.url + "newsCollention/findNewsCollectionByUser"
          },
          callback: upCallBack,
          empty: {
            tip: "暂无更多数据",
          },
          htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
          loadFull: {
            use: true,
            delay: 0
          }
        },
        down: {
          use: false
        }
      });
    }

    function upCallBack(params) {
      getListData({
        num: params.num,
        size: params.size,
        url: params.url,
        flag: params.flag,
        className: params.className,
        successCallback: function (result) {
          paramObj.mescroll.endSuccess(result.data.length);
          setListData(result);
        },
        errorCallback: function () {
          paramObj.mescroll.endErr();
        }
      });
    }

    /*设置列表数据*/
    function setListData(params) {
      var lidom = "";
      if (params.flag == "info") {
        for (var i = 0; i < params.data.length; i++) {
          if (params.data[i].picUrl == null || params.data[i].picUrl == "") {
            lidom += `<li><div class="content"><div class="title"><a href="./../pages/essay_detail.html?fInfoId=${params.data[i].collectionId}">${params.data[i].collectionName}</a></div><div class="tip"><p>${params.data[i].author}</p><p>${params.data[i].lastUpdateTime}</p></div></div></li>`;
          } else {
            lidom += `<li><div class="content"><div class="title"><a href="./../pages/essay_detail.html?fInfoId=${params.data[i].collectionId}">${params.data[i].collectionName}</a></div><div class="tip"><p>${params.data[i].author}</p><p>${params.data[i].lastUpdateTime}</p></div></div><img class="img" src="${params.data[i].picUrl}"></li>`;
          }
        }
      } else if (params.flag == "index") {
        for (var i = 0; i < params.data.length; i++) {
          if (params.data[i].collectionId.substr(0,6)== "energy") {
              let ids = params.data[i].indexId
              let type = ids.split(",")[0];
              let energyId = ids.split(",")[1];
            lidom += `<li><div><a href="./energy_radarPage.html?type=${type}&indexId=${params.data[i].collectionId}&itemName=${params.data[i].collectionName}&energyId=${energyId}">${params.data[i].collectionName}</a></div><div><p>${params.data[i].lastUpdateTime}</p></div></li>`;
          } else {
            lidom += `<li><div><a href="./../pages/forecast_index.html?topic=${params.data[i].collectionId}&index=${params.data[i].indexId}">${params.data[i].collectionName}</a></div><div><p>${params.data[i].lastUpdateTime}</p></div></li>`;
          }
        }
      } else if (params.flag == "expert") {
        params.data.forEach(function (v) {
          let lable = ``;
          for (let i = 0; i < v.expertTarget.length; i += 2) {
            if (v.expertTarget[i + 1] != undefined) {
              lable += `<p class="lable"><span>${v.expertTarget[i].name}</span><span>${v.expertTarget[i+1].name}</span></p>`;
            } else {
              lable += `<p class="lable"><span>${v.expertTarget[i].name}</span></p>`;
            }
          }
          lidom += `<li>
                                <div><a href="./../pages/expert_detail.html?expertId=${v.expertId}"><img src="${v.headImage}"></a></div>
                                <div>
                                    <a href="./../pages/expert_detail.html?expertId=${v.expertId}">${v.expertName}</a>
                                    <a class="rank" href="./../pages/expert_detail.html?expertId=${v.expertId}">${v.expertTitleForOne.name}</a>
                                    ${lable}
                                </div>
                            </li>`
        })
      }
      $(params.className).append(lidom);
    }

    /*加载列表数据*/
    function getListData(params) {
      $.ajax({
        url: params.url,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authentication", paramObj.token);
        },
        data: {
          page: params.num,
          size: params.size
        },
        success: function (result) {
          if (result.resultCode == "200") {
            paramObj.mescroll.endSuccess();
            params.successCallback({
              data: result.resultBody,
              className: params.className,
              flag: params.flag
            });
          } else if (result.resultCode == "201") {
            paramObj.mescroll.endSuccess(false);
            params.successCallback({
              data: [],
              className: params.className,
              flag: params.flag
            });
          } else if (result.resultCode == "401" || result.resultCode == "402" || result.resultCode == "405") {
            redirectUrl();
          }
        },
        error: function (err) {
          params.errorCallback();
          console.log(err);
        }
      })
    }
  }
  $(".collect_header .back").click(function () {
    window.location.href = "./../myself.html";
  })
  $("#info_ul").on("click", ".title", function () {
    sessionStorage.setItem("inforSource", "./collect.html")
  })
  $(".expert_ul").on("click", "a", function () {
    sessionStorage.setItem("expertSource", "./collect.html")
  })
  $("#index_ul").on("click", "a", function () {
    sessionStorage.setItem("energySource", "./collect.html")
  })
})