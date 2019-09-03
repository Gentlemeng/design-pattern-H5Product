$(function () {

    var paramObj = {
        indexId: parseURL(window.location.href).expertId,
        // reportCategoryId: parseURL(window.location.href).report,
        // topicId: parseURL(window.location.href).topic,
        token: "",
        mescroll: [],
        infoId: "",
        indexUrl: indexUrl,
        newCmsUrl: newCmsUrl,
        height: "",
        height2: "",
        expertListData:function(){
            let expertListData = JSON.parse(sessionStorage.getItem("expertListData"));
            return expertListData?expertListData:[];
        }(),
        expertSource:function(){
            var expertSource = sessionStorage.getItem("expertSource")
            return expertSource?expertSource:'./../expert.html'
        }
    }
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    $(".back_wrap").on("click",".back",function(){
        // if(history.length>1&&document.referrer.indexOf("expert.html")!=-1){//从专家页跳过来的
        //     window.history.go(-1);
        //     return false;
        // }else{
            $(this).attr({"href":paramObj.expertSource})
        // }
    }) 
    //内容展开
    $(".show").on("click",function(){
        let conentDom = $(this).prev()
        conentDom.toggleClass("text_hide").toggleClass("text_show").toggleClass("col_3_hide");
        $(this).toggleClass("open").toggleClass("close");
    })
    //点击收藏
    $("header").on("click", ".follow_btn", function () {
        if (paramObj.token == "") {
            dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
            return
        }
        let followStatus =handleFollow({
            token: paramObj.token,
            data: {
                expertId: paramObj.indexId
            },
            url: paramObj.newCmsUrl + "expertCollection/insertOrUpsertExpert",
            target: $(".follow_btn")
        });
        paramObj.expertListData.forEach(function(data,index){
            if(data.expertId===paramObj.indexId){
                data.deleteYn = followStatus
            }
        })
        sessionStorage.setItem("expertListData",JSON.stringify(paramObj.expertListData))
    })
    // //收藏
    // function handleFollow(param) {
    //     $.ajax({
    //         url: paramObj.newCmsUrl + "expertCollection/insertOrUpsertExpert",
    //         beforeSend: function (xhr) {
    //             xhr.setRequestHeader("Authentication", paramObj.token);
    //         },
    //         data: param.data,
    //         success: function (result) {
    //             // console.log(result);
    //             if (result.resultBody && result.resultCode === "200") {
    //                 var followData = result.resultBody.result;
    //                 if (followData == 0) { //未收藏
    //                     $(".follow_btn").removeClass("followed").addClass("unFollow").text("收藏");
    //                 } else {
    //                     $(".follow_btn").removeClass("unFollow").addClass("followed").text("取消收藏");
    //                 }
    //             } else if (result.resultCode === "401" || result.resultCode === "402" || result.resultCode === "405") {
    //                 dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
    //             }
    //         }
    //     })
    // }
    getExpert();
    //专家详情
    function getExpert() {
        $.ajax({
            url: paramObj.newCmsUrl + "expert/findExpertDetail",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                expertId: paramObj.indexId
            },
            success: function (res) {
                if (res.resultCode == 200) {
                    var e = res.resultBody;
                    var targethtml = "";
                    var titlehtml = "";
                    $(".master_name").html(e.expertName);
                    $(".master_img").find("img").attr("src", e.headImage);
                    var str = e.expertJobTitle?e.expertJobTitle.map(function (elem, index) {
                        return elem.name;
                    }).join("、"):'';
                    targethtml = `
                       <li><span>${str}</span></li>
                         `;
                    $(".master_duty").append(targethtml);
                    e.expertTitle.forEach(function (item) {
                        titlehtml += `
                        <li><span>${item.name}</span></li>
                        `
                    });
                    $(".master_title").html(titlehtml);
                    $(".infor_main").addClass("text_hide").find(".infor_main_p").html(e.expertDesc);
                    $(".research_main").addClass("text_hide").find(".research_main_p").html(e.researchField);
                    // 若父元素的最大高度大于p元素（文章内容）的高度时，隐藏展开收起按钮
                    isTextHide($(".infor_main .infor_main_p"))?'': $(".infor_main").next().hide();
                    isTextHide($(".research_main .research_main_p"))?'':$(".research_main").next().hide();
                    
                    if (e.collected) {
                        $(".follow_btn").removeClass("unFollow").addClass("followed").text("取消收藏");
                    }
                }
            },
            error: function (e) {
                console.log(e);
            }
        })
    }
    pastReport();
    // 获取往期周报  
    function pastReport(infoId) {
        paramObj.mescroll = new MeScroll("main", {
            down: {
                use: false
            },
            up: {
                callback: upCallback,
                page: {
                    num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                    size: 10, //每页数据条数,默认10
                    infoId: infoId
                },
                clearEmptyId: "mescroll",
                empty: {
                    //提示
                },
                lazyLoad: {
                    use: true
                },
                htmlNodata: '<p class="upwarp-nodata">—— End ——</p>',
            }

        })
    }

    function upCallback(page) {
        var data = {
            pageNo: page.num,
            pageSize: page.size,
            expertId: paramObj.indexId
        };

        $.ajax({
            url: paramObj.newCmsUrl + "expert/findExpertData",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: data,
            success: function (curPageData) {
                // console.log(curPageData);
                if (curPageData.resultCode == 200) {
                    paramObj.mescroll.endSuccess(curPageData.resultBody.length);
                    setListData(curPageData.resultBody);
                } else if (curPageData.resultCode == 201) {
                    var Str = `<div class="nomore">当前没有观点</div>`
                    $(".mescroll-hardware").hide();
                    $(".mescroll-upwarp").hide();
                    $(".mescroll").append(Str);
                }
            },
            error: function (e) {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态
                paramObj.mescroll.endErr();
                if (JSON.parse(e.responseText).resultCode == 401) {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }
            }
        })
    }

    function setListData(data) {
        if (!($.isEmptyObject(data))) {
            var liStr = "";
            data.forEach(function (item) {
                liStr = ` <li>
                    <a href="./../pages/expert_view.html?infoId=${item.infoId}&&expertId=${paramObj.indexId}">
                        <div class="view_cont">${item.infoTitle}</div>
                        <div class="auti">
                            <span class="view_name">${item.author}</span>
                            <span class="view_time">${item.infoPublishDate}</span>
                        </div>   
                    </a>
                </li>`
                $(".mescroll").append(liStr);
            })
            // $(".item_wrap").click(function () {
            //     paramObj.infoId = $(this).attr("infoId");
            //     $(".mescroll").empty();
            //     $(".report_cont").empty();
            //     $(window).scrollTop(0);
            //     nowReport();
            //     pastReport(paramObj.infoId);
            // })
            // $(".mescroll-hardware").hide();
            // $(".mescroll-upwarp").hide();
        }

    }
    function isTextHide(pDom){
        let conentMaxHeight = pDom.parent().css("max-height");
        let pHeight = pDom[0].scrollHeight;
        let isHide=parseInt(conentMaxHeight)>parseInt(pHeight)? false:true;
        return isHide
    }
})