$(function(){
    let mainHeigh = $(".main").height();
    let bannerHeight = $(".expert_banner_wrap").height();
    $(".content").height(mainHeigh-bannerHeight);
    var paramObj={
        url:newCmsUrl,
        enterLink:"http://www.tjresearch.cn/invitation/index.html?type=h5",
        token:null,
        searchFlag:'expert',//默认搜索专家库expert,专家之声为expertVoice
        industryId:function(){
            let industryId = sessionStorage.getItem("industryId");
            return industryId?industryId:"-1";
        }(),
        isFirstTab:true,
        isFirstBozhiTab:true,
        expertTabIndex:function(){
            let obj = parseURL(window.location.href);
            let expertTabIndex;
            if(obj.expertTabIndex){
                expertTabIndex = obj.expertTabIndex;
                sessionStorage.setItem("expertTabIndex",expertTabIndex);
            }else{
                expertTabIndex = sessionStorage.getItem("expertTabIndex");
            }
            return expertTabIndex?expertTabIndex:"0";
        }(),
        expertScrollTop:function(){
            let expertScrollTop = sessionStorage.getItem("expertScrollTop");
            return expertScrollTop?expertScrollTop:0;
        }(),
        expertListPage:function(){
            var expertListPage = sessionStorage.getItem('expertListPage')
            if(expertListPage&&Number(expertListPage)>0){
                return Number(expertListPage)-1
            }else{
                return 0
            }
        }(),
        expertListData:function(){
            let expertListData = JSON.parse(sessionStorage.getItem("expertListData"));
            return expertListData?expertListData:[];
        }(),
        useStorage:false,
        mescroll:{
            expertMescroll:null,
            expertVoiceMescroll:null,
        },
        size:5,
    }
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    //banner
    asyncRequest({
        url:paramObj.url+'expert/findCarousel',
        data:null,
        callBack:function(result){
            let bannerData = result;
            let htmlStr = '';
            bannerData.forEach(function(data,index){
                htmlStr += `<div class="swiper-slide expert_banner_img">
                    <a href="javascript:;" class="expert_banner_link" style="background:url(${data.imgUrl}) no-repeat center/cover"></a>
                </div>`;
            })
            $(".expert_banner_wrapper").html(htmlStr);
            // 轮播图
            new Swiper('.expert_banner', {
                autoplay : 2500,
                autoplayDisableOnInteraction : false,
                pagination: '.expert_banner_page'
            })
        }
    })
    //请求专家分类
    asyncRequest({
        url:paramObj.url+'expert/findIndustryList',
        data:null,
        callBack:function(result){
            var categoryData = result;
            // let ulStr ='';
            //外层循环控制行渲染，内层循环控制列渲染
            categoryData.forEach(function(data,index) {
                let ulStr = "<ul class='expert_category_ul'>"
                for(var i=0;i<data.length;i++){
                    // if(i===0 && index===0)paramObj.industryId = data[i].industryId;
                    ulStr+=`<li class="expert_category_list" industryId="${data[i].industryId}">
                            <a class="col_1_hide" industryId="${data[i].industryId}" href="javascript:;">${data[i].industryName}</a>
                        </li>`
                }
                ulStr += '</ul>'
                $(".expert_category_uls").append(ulStr);     
                ulStr = '';           
            });
            // if(paramObj.industryId){
                $(`.expert_category_list[industryId=${paramObj.industryId}]`).addClass("active");
            // }else{
            //     let firstCategory = $($(`.expert_category_list`)[0])
            //     firstCategory.addClass("active");
            //     sessionStorage.setItem("industryId",firstCategory.attr("industryId"))
            // }
        }
    })
    createExpertMescroll();


    //分类区域切换事件
    $(".expert_category_uls").on("click",".expert_category_list",function(){

            
        paramObj.expertListData = [];
        paramObj.expertListPage = 0;
        paramObj.mescroll.expertMescroll.scrollTo( 0,0 );
        paramObj.mescroll.expertMescroll.destroy();
        if(paramObj.searchFlag=='expert'){
            createExpertMescroll()
        }else{
            // paramObj.mescroll.expertVoiceMescroll.scrollTo( 0,0 );
            // paramObj.mescroll.expertVoiceMescroll.destroy();
        }
        $(this).siblings().removeClass("active");
        $(this).parent().siblings().find(".expert_category_list").removeClass("active")
        $(this).addClass("active");
        let industryId = $(this).attr("industryId")
        paramObj.industryId = industryId;
        sessionStorage.setItem("industryId",industryId)
    })
    new Swiper('.expert_container', {
        pagination: '.expert_tab_ul',
        paginationClickable: true,
        initialSlide: paramObj.expertTabIndex,
        effect : 'fade',
        // initialSlide: paramObj.particiTabIndex,
        paginationBulletRender: function(swiper, index, className) {
            var name = '';
            var swiper_expert_className = '';
            switch (index) {
                case 0:
                    name = '专家库';
                    swiper_expert_className = 'expert_tab_left';
                    break;
                case 1:
                    name = '专家之声';
                    swiper_expert_className = 'expert_tab_middle';
                    break;
                case 2:
                    name = '博智宏观论坛';
                    swiper_expert_className = 'expert_tab_right';
                    break;
            }
            // return '<li class="' + className + '">' + name + '</li>';
            return `<li class="${className} clear"><p class="swiper_expert_p ${swiper_expert_className}">${name}</p></li>`
        }
    })
    if(paramObj.expertTabIndex==2){

        reqEnterData();
        paramObj.isFirstBozhiTab = false
        $(".expert_category").hide()
    }
    //切换专家tab
    $(".expert_tab_ul").on("click","li",function(){
        let index = $(this).index();
        paramObj.expertListData = [];
        paramObj.expertListPage = 0;
        if(index<2){
            if(index==0){
                paramObj.searchFlag = "expert";
                paramObj.mescroll.expertMescroll.destroy();
                createExpertMescroll()

            }else if(index==1){
                paramObj.searchFlag = "expertVoice";
                if(paramObj.isFirstTab){
                    //请求专家之声列表
                    // createVoiceMescroll();
                }
                paramObj.isFirstTab = false;
            }
            $(".expert_category").show()
        }else if(index == 2){
            $(".expert_category").hide()
            if(paramObj.isFirstBozhiTab){
                reqEnterData();
                paramObj.isFirstBozhiTab = false;
            }
        }
        sessionStorage.setItem("expertTabIndex",index);
    })
    //键盘回弹
    $('body').on('blur', ".expert_search_input",function() {
        window.scroll(0, 0);
    });
    //关键词搜索
    $(".expert_search").on("click",function(){
        $.dialog({
            type: "confirm",
            buttonText:{
                ok:'搜索',
                cancel : '取消',
            },
            onClickOk: function () {
                let keyText = $.trim($(".expert_search_input").val());
                if(keyText){
                    if(paramObj.searchFlag=='expert'){
                        paramObj.mescroll.expertMescroll.scrollTo( 0,0 );
                        paramObj.mescroll.expertMescroll.destroy();
                    }else{
                        paramObj.mescroll.expertVoiceMescroll.scrollTo( 0,0 );
                        paramObj.mescroll.expertVoiceMescroll.destroy();
                    }
                    createExpertMescroll(keyText)
                    
                    //请求专家列表/专家之声列表
                    // asyncRequest({
                        
                    // })
                }
            },
            autoClose: 0,
            contentHtml: `<div style="display:flex;justify-content: center;">
                            <input class="expert_search_input" type="search" placeholder="请输入..."/>
                        </div>`
        });
    })
    //收藏/取消收藏
    $(".expert_ul").on("click", ".follow_btn", function () {
        if(sessionData){
            let target = $(this);
            let expertId = $(this).parents(".expert_list").attr("itemId");
            let followStatus = handleFollow({
                token:paramObj.token,
                data: {
                    expertId:expertId,
                    // industryId:paramObj.industryId
                },
                url: paramObj.url + 'expertCollection/insertOrUpsertExpert',
                target:target
            });
            paramObj.expertListData.forEach(function(data,index){
                if(data.expertId===expertId){
                    data.deleteYn = followStatus
                }
            })
            sessionStorage.setItem("expertListData",JSON.stringify(paramObj.expertListData))
        }else{
            dialogConfirm();
        }
        
    })
    $(".expert_ul").on("click",".expet_link",function(){
        sessionStorage.setItem("expertSource","./../expert.html")
    })
    //记录scrollTop
    $(".expert_wrap").on("scroll",function(){
        sessionStorage.setItem("expertScrollTop",$(this).scrollTop())
    })
    $(".sign_up_bozhi a").on("click",function(){
        if(sessionData){
            var self = $(this);
            var havePermission = true;
            $.ajax({
                url:paramObj.url+'sign/userLandStatus',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                async:false,
                success:function(result){
                    if(result.resultCode!=="200"){
                        havePermission = false;
                    }else{
                        havePermission = true;
                    }
                },
                error:function(err){
                    console.log(err);
                },
                complete:function(){
                    if(!havePermission){
                        dialogAlert("暂无权限或报名系统出错，请稍后重试。")
                        self.attr({"href":"javascript:;"})
                    }else{
                        self.attr({"href":paramObj.enterLink})
                    }
                },
            })
        }else{
            dialogConfirm();
            return false
        }
    })
    //请求专家库列表
    function createExpertMescroll(keyText){
        paramObj.mescroll.expertMescroll = new MeScroll("expert_wrap", {
            down:{
                beforeLoading:function(){
                    paramObj.expertListData = []
                }
            },
            up: {
                callback: reqExpertCallback,
                page: {
                    // num: paramObj.actRecordPage,
                    url:paramObj.url+'expert/findExpertListByindustryId',
                    num: paramObj.expertListPage,
                    size:paramObj.size,
                    className: ".expert_ul",
                    type:"1",
                    keyText:keyText||'',
                },
                clearEmptyId: "expert_ul",
                htmlNodata: '<p class="upwarp-nodata">无更多记录</p>',
                empty: {
                    tip: keyText?"暂无相关搜索信息":"无更多记录"
                },
                noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })
    }
    function createVoiceMescroll(){
        paramObj.mescroll.expertVoiceMescroll = new MeScroll("expert_voice_wrap", {
            down: {
                use: false
            },
            up: {
                callback: reqExpertCallback,
                page: {
                    // num: paramObj.actRecordPage,
                    num: 0,
                    size:10,
                    className: ".expert_voice_ul",
                    type:"2"
                },
                clearEmptyId: "expert_voice_ul",
                htmlNodata: '<p class="upwarp-nodata">无更多记录</p>',
                empty: {
                    tip: "无更多记录" //提示
                },
                noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })
    }
    function reqExpertCallback(page){
        reqExpertData({
            url:page.url,
            data:{
                className: page.className,
                pageSize: page.size,
                pageNum: page.num,
                type:page.type,
                keyText:page.keyText,
            },
            successCallback: function (curPageData) {
                if(page.type=="1"){
                    paramObj.mescroll.expertMescroll.endSuccess(curPageData.length);
                    callBack(curPageData);
                }else{
                    paramObj.mescroll.expertVoiceMescroll.endSuccess(curPageData.length);
                }           
            },
            errorCallback: function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                if(page.type=="1"){
                    paramObj.mescroll.expertMescroll.endErr();
                }else{
                    paramObj.mescroll.expertVoiceMescroll.endErr();
                }
            }
        })
    }
    //公共请求方法
    function asyncRequest(params){
        let {url,data,callBack} = params
        new Promise(function(resolve,reject){
            $.ajax({
                url:url,
                data:data,
                success:function(result){
                    if(result.resultCode === '200'){
                        resolve(result.resultBody);
                    }else if(result.resultCode==='201'){
                        resolve([]);
                    }else if(result.resultCode==='500'){
                        reject('500')
                    }else{
                        reject('请求错误')
                    }
                },
                error:function(err){
                    reject(err)
                }
            })
        }).then(function(result){
            callBack(result)
        }).catch(function(err){
            console.log(err);
            // throw new Error(err)
        })
    }
    //请求专家库列表/专家之声列表
    function reqExpertData(params){
            let {url,data} = params;
            let {type,pageNum,pageSize,keyText} = data;
            new Promise(function(resolve,reject){
                if(paramObj.expertListData.length&&!paramObj.useStorage){
                    paramObj.useStorage = true;
                    resolve({data:paramObj.expertListData,isScrollTo:true})
                }else{
                    paramObj.useStorage = true;
                    $.ajax({
                        url:url,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authentication", paramObj.token);
                        },
                        data:{
                            industryId:paramObj.industryId||-1,
                            page:pageNum,
                            size:pageSize, 
                            keyword:keyText
                        },
                        success:function(result){
                            if(result.resultCode === '200'){
                                paramObj.expertListData = paramObj.expertListData.concat(result.resultBody)
                                let sessionExpertList = JSON.stringify( paramObj.expertListData)
                                sessionStorage.setItem("expertListData",sessionExpertList)
                                //将本次请求页码存起来
                                sessionStorage.setItem("expertListPage",pageNum)
                                resolve({data:result.resultBody,isScrollTo:false});
                            }else if(result.resultCode==='201'){
                                sessionStorage.setItem("expertListPage",pageNum-1)
                                resolve({data:[],isScrollTo:false});
                            }else if(result.resultCode==='500'){
                                reject('500 请求列表错误')
                            }else{
                                reject('请求列表错误')
                            }
                        },
                        error:function(err){
                            reject(err)
                        }
                    })
                }
                
            }).then(function(result,isScrollTo){
                if(type=="1"){
                    paramObj.mescroll.expertMescroll.endSuccess()
                }else{
                    paramObj.mescroll.expertVoiceMescroll.successCallback.endSuccess()
                }
                params.successCallback(result.data)
                if(result.isScrollTo){
                    $(".expert_wrap").scrollTop(paramObj.expertScrollTop);
                }
            }).catch(function(err){
                if(type=="1"){
                    paramObj.mescroll.expertMescroll.endSuccess()
                }else{
                    paramObj.mescroll.expertVoiceMescroll.successCallback.endSuccess()
                }
                params.successCallback([])
                throw new Error(err)
            })
        // }
        
    }
    function callBack(result){
        // if(result.length){
            // let target=page.type=='1'?$(".expert_ul"):$(".expert_voice_ul");
            let target=$(".expert_ul");
            let htmlStr = '',rankStr = '',labelStr='';
            result.forEach(function(data){
                htmlStr+=`<li class="expert_list" itemId="${data.expertId}">
                            
                                <a name="${data.expertId}" class="expert_avatar expert_link" href="./pages/expert_detail.html?expertId=${data.expertId}">
                                    <div style="background:url(${data.headImage}) no-repeat center/100% 100%;"></div>
                                </a>
                                <div class="expert_intro">
                                    <div class="expert_top">
                                        <p class="expert_name"><a class="expert_name_link expert_link" href="./pages/expert_detail.html?expertId=${data.expertId}">${data.expertName}</a></p>
                                            <div class="follow_wrap">
                                                <div class="follow_btn ${data.deleteYn?'followed':'unFollow'}">${data.deleteYn?'取消收藏':'收藏'}</div>
                                             </div>
                                    </div>
                                    <a class="expert_link" href="./pages/expert_detail.html?expertId=${data.expertId}">
                                        <ul class="expert_rank"></ul>
                                    </a>
                                    <div class="expert_label_ul"></div>
                                </div>
                        </li>`
                target.append(htmlStr);
                //头衔只展示一个
                // data.expertTarget.forEach(function(data){
                    var expertRank = data.expertTitleForOne.name;
                    rankStr+=`<li class="col_2_hide" rankId="${data.expertTitleForOne.id}">${expertRank?expertRank:''}</li>`
                // })
                //标签最多展示两行
                // data.expertTarget.forEach(function(data){
                //     labelStr+=`<li class="expert_label" labelId="${data.id}">${data.name}</li>`
                // })
                data.expertTarget.forEach(function(data,index){
                    if(index%2===0){
                        labelStr+=`<ul class="expert_label"><li class="expert_label_list">${data.name}</li>`
                    }else{
                        labelStr+=`<li class="expert_label_list">${data.name}</li></ul>`
                    }
                })
                target.find(`.expert_list[itemId=${data.expertId}] .expert_rank`).html(rankStr)
                target.find(`.expert_list[itemId=${data.expertId}] .expert_label_ul`).html(labelStr)
                htmlStr='';
                rankStr='';labelStr=''
            });
            // if(paramObj.useStorage){
            //     paramObj.useStorage = true;
                
            // }
            
            // if(paramObj.expertScrollTop){
            //     $(".expert_wrap").scrollTop(paramObj.expertScrollTop);
            //     paramObj.expertScrollTop = undefined;
            // }
    }
    function reqEnterData(){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url+'sign/findSignUpForNew',
                success:function(result){
                    if(result.resultCode === "200"){
                        resolve(result.resultBody)
                    }else{
                        reject("请求报名数据错误")
                    }
                },
                error:function(){
                    reject("请求报名数据错误")
                }
            })
        }).then(function(result){
            let {picUrl,xcoordinate:left,ycoordinate:top,showSign,picheight} = result;
            left = Number(left)/100+'rem';
            top = Number(top)/100+'rem';
            picheight = Number(picheight)/100+'rem'
            $(".expert_bozhi_ul").css({"background":`url(${picUrl}) no-repeat center/cover`,"min-height":picheight});
            Boolean(showSign)?$(".sign_up_bozhi").show().css({"left":left,"top":top}):$(".sign_up_bozhi").hide()
        }).catch(function(err){
            paramObj.isFirstBozhiTab = true;
            dialogAlert(err)
        })
    }
    
})