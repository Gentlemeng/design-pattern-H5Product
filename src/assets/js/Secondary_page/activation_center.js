$(function(){
    var paramObj={
        url: newCmsUrl,
        checkCodeUrl:newCmsUrl+"CDKey/activate",
        reqCodeRecordUrl:newCmsUrl+'activation/findActivationList',
        actCodeText:"验证码",
        QRcodeText:"二维码",
        // actRecordPage:0,
        key:function(){
            var keycode = sessionStorage.getItem("keycode");
            return keycode?keycode:''
        }(),
        cardUsearea:'全版块',
        mescroll:{
            actCodeMeScroll:null,
            QRcodeMeScroll:null
        },
        isFirstActRecord:false,
        isFirstQRRecord:true,
        token:'',
        size:10,
    }
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    //实例化规则
    let activeRule = SingleRule.getInstance();
    //用户登录回来将key（激活码）放入输入框
    $(".activation_input").val(paramObj.key)
    $(".activation_input").attr({"placeholder":`请输入${paramObj.actCodeText}`})
    //键盘回弹
    $('.activation_input').on('blur', function() {
        window.scroll(0, 0);
    });
    /**
     * 点击激活按钮
     */
    $(".activation_btn").on("click",function(){
        var value = $.trim($(".activation_input").val())
        if(value){
            new Promise(function(resolve,reject){
                $.ajax({
                    url:paramObj.checkCodeUrl,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authentication", paramObj.token);
                    },
                    type:'post',
                    data:{
                        key:value
                    },
                    success:function(result){
                        if(result.status=="500"){
                            reject(result)
                        }else{
                            resolve(result)
                        }
                    },
                    error:function(err){
                        reject(err)
                    }
                })
            }).then(function(result){
                var status = result.status,
                alertMsg = '';
                if(status == '200'){
                    sessionStorage.removeItem('keycode')

                    var cardType = result.body.cardType
                    if(cardType=='day'){
                        alertMsg +=`<p>本 <span class="act_alertMsg">${result.body.cardShowName}</span>包含以下权限：</p>
                                    <p>解锁内容：<span class="act_alertMsg">${paramObj.cardUsearea}</span></p>
                                    <p>使用期限：<span class="act_alertMsg">${result.body.cardShowInclude}</span></p>`
                    }else if(cardType=='gold'){
                        alertMsg +=`<p>本 <span class="act_alertMsg">${result.body.cardName} </span>包含：<span class="act_alertMsg">${result.body.cardShowInclude}</span></p>`
                    }
                    // dialogConfirm(alertMsg);
                    $.dialog({
                        type: "alert",
                        onClickOk: function () {
                            return false
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">${alertMsg}</p>`
                    });
                    $(".activation_input").val("");
                    paramObj.mescroll.actCodeMeScroll.destroy();
                    reqActRecord();
                }else if(status === "401" || status === "402" || status === "405") {
                        sessionStorage.setItem('keycode',value)
                        dialogConfirm();

                }else if(status ==="403"){
                    sessionStorage.removeItem('keycode')
                    var msg = result.msg;
                    var actCodeText = paramObj.actCodeText;
                    switch (msg)
                    {
                        case '4031':
                        alertMsg = `该${actCodeText}有误，请再次确认`
                        break
                        case '4032':
                        alertMsg = `该${actCodeText}已被禁用。`
                        break
                        case '4033':
                        alertMsg = `该${actCodeText}已使用，激活失败。` 
                        break
                        case '4034':
                        alertMsg = `该${actCodeText}不能叠加使用`
                        break
                        case '4035':
                        alertMsg = `未知的此${actCodeText}类型`
                        break
                    }
                    dialogAlert(alertMsg,0);
                }
            }).catch(function(err){
                throw new Error(err);
            })
        }else{
            dialogAlert(`请输入${paramObj.actCodeText}`)
        }
    })
    $(".activation_reset").on("click",function(){
        var actValue = $(".activation_input").val();
        if(actValue){
            $(".activation_input").val("")
        }
    })
    /**
     * 规则相关
     */
    new Promise((resolve,reject)=>{
        $.ajax({
            url:paramObj.url +'rule/findRuleById',
            data:{
                typeId:"4"
            },
            success:function(res){
                // console.log(res)
                if(res.resultCode == "200"){
                    // console.log(res.resultBody.ruleInfo)
                    resolve(res.resultBody.ruleInfo);
                }else if(res.resultCode=="201"){
                    resolve([{value:"无"}])
                }else{
                    reject('请求规则失败')
                }
            },
            error:function(err){
                reject(err)
            }
        })
    }).then((res)=>{
        activeRule.customRultBtnClick(".activation_rule_btn",res)
    }).catch((err)=>{
        console.log(err)
    })
    /**
     * 激活记录相关
     */
    reqActRecord();
    var actSwiper = new Swiper('.act_swiper', {
        // initialSlide: paramObj.inforTabIndex,
        pagination: '.act_tab_ul',
        paginationClickable: true,
        onlyExternal: true,
        paginationBulletRender: function (swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '验证码激活记录';
                    break;
                case 1:
                    name = '二维码激活记录';
                    break;
            }
            // return '<li class="'+commonClassName +' '+ className + '">' + name + '</li>';
            return `<li class="${className}">${name}</li>`
        }
    })
    //切换tab栏 请求二维码激活记录
    $('.swiper-pagination-bullet').on("click", function () {
        if (!$(this).hasClass("swiper-pagination-bullet-active")) {
            if ($(this).index() === 0) {
                // if (paramObj.isFirstActRecord) { //第一次切换到热点好文
                //     reqActRecord();
                //     paramObj.isFirstActRecord = false
                // }
            } else {
                if (paramObj.isFirstQRRecord) {
                    reqQERecord();
                    paramObj.isFirstQRRecord = false
                }
            }
        }
    })
    function reqActRecord(){
        paramObj.mescroll.actCodeMeScroll = new MeScroll("act_record_main", {
            down: {
                use: false
            },
            up: {
                callback: reqRecordCallback,
                page: {
                    // num: paramObj.actRecordPage,
                    num: 0,
                    className: ".act_record_ul",
                    type:"1"
                },
                clearEmptyId: "act_record_ul",
                htmlNodata: '<p class="upwarp-nodata">无更多记录</p>',
                empty: {
                    tip: "无更多记录" //提示
                },
                // noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })
    }
    function reqQERecord(){
        paramObj.mescroll.QRcodeMeScroll = new MeScroll("QRcode_record_main", {
            down: {
                use: false
            },
            up: {
                callback: reqRecordCallback,
                page: {
                    // num: paramObj.QRRecordPage,
                    num:0,
                    className: ".QRcode_record_ul",
                    type:"2"
                },
                clearEmptyId: "QRcode_record_ul",
                htmlNodata: '<p class="upwarp-nodata">无更多记录</p>',
                empty: {
                    tip: "无更多记录" //提示
                },
                // noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })
    }
    function reqRecordCallback(page) {
        reqRecordList({
            className: page.className,
            pageNum: page.num,
            type:page.type,
            successCallback: function (curPageData) {
                if(page.type=="1"){
                    paramObj.mescroll.actCodeMeScroll.endSuccess(curPageData.length);
                    // console.log("aaa")
                }else{
                    paramObj.mescroll.QRcodeMeScroll.endSuccess(curPageData.length);
                }
                drawRecordList(curPageData,page.className);               
            },
            errorCallback: function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                if(page.type=="1"){
                    paramObj.mescroll.actCodeMeScroll.endErr();
                }else{
                    paramObj.mescroll.QRcodeMeScroll.endErr();
                }
            }
        });
    }
    /** 激活记录
     * type=1 激活码激活
     * type=2 二维码激活
     */
    var a = true
    function reqRecordList(param){
        var type = param.type
        new Promise(function(resolve,reject){
            $.ajax({
                url:paramObj.reqCodeRecordUrl,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    page:param.pageNum,
                    size:paramObj.size,
                    type:type
                },
                success:function(result){
                    resolve(result)
                },
                error:function(err){
                    reject(err)
                }
            })
            
        }).then(function(result){
            // console.log(reslt)
            if(result.resultCode=='401'||result.resultCode=='402'||result.resultCode=='405'){
                if (type === "1") {
                    paramObj.mescroll.actCodeMeScroll.endSuccess();
                    param.successCallback([]);
                } else {
                    paramObj.mescroll.QRcodeMeScroll.endSuccess();
                    param.successCallback([]);
                }
                dialogConfirm('请登录查看激活记录');
            }
            else if(result.resultCode == '200'||result.resultCode =='201'){
                var listData = result.resultBody;
                if (listData.length) {
                    if (type === "1") {
                        paramObj.mescroll.actCodeMeScroll.endSuccess();
                        param.successCallback(listData);

                    } else {
                        paramObj.mescroll.QRcodeMeScroll.endSuccess();
                        param.successCallback(listData);  
                    }
                    
                } else { //上拉无数据时 
                    if (type === "1") {
                        paramObj.mescroll.actCodeMeScroll.endSuccess();
                        param.successCallback([]);
                    } else {
                        paramObj.mescroll.QRcodeMeScroll.endSuccess();
                        param.successCallback([]);
                    }
                }
            } else {
                if (type === "1") {
                    paramObj.mescroll.actCodeMeScroll.endSuccess();
                    param.successCallback([]);
                } else {
                    paramObj.mescroll.QRcodeMeScroll.endSuccess();
                    param.successCallback([]);
                }
            }
        }).catch(function(err){
            if (type === "1") {
                paramObj.mescroll.actCodeMeScroll.endSuccess();
                param.successCallback([]);
            } else {
                paramObj.mescroll.QRcodeMeScroll.endSuccess();
                param.successCallback([]);
            }
            dialogAlert('请求激活记录失败')
            throw new Error(err);
        })
    }
    /**
     * 渲染列表
     */
    function drawRecordList(list,className){
        var htmlStr = ''
        list.forEach(function(data){
            var actTime = data.actTime.substring(0,16);
            htmlStr+=`<li class="record_list">
                            <span class="record_time">${actTime}</span>
                            <span class="record_name">${data.cardShowName}</span>
                        </li>`
        })
        $(className).append(htmlStr);
    }
    
})