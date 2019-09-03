$(function(){
    var paramObj = {
        url:newCmsUrl,
        viewHistoryMescroll:null,
        token:'',
    }
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    paramObj.viewHistoryMescroll = new MeScroll("view_list_mescroll", {
        up: {
            callback: reqHistroyCallback,
            page: {
                // num: paramObj.actRecordPage,
                url:paramObj.url+'view/historyView',
                num: 0,
                className: ".view_history_ul",
            },
            clearEmptyId: "view_history_ul",
            htmlNodata: '<p class="upwarp-nodata">没有更多观点</p>',
            empty: {
                tip: "没有更多观点"
            },
            noMoreSize: 1,
            lazyLoad: {
                use: true
            }
        }
    })
    function reqHistroyCallback(page){
        reqHistoryData({
            url:page.url,
            data:{
                num: page.num,
            },
            successCallback: function (curPageData) {
                    paramObj.viewHistoryMescroll.endSuccess(curPageData.length)
                    drawViewHistory(curPageData)   
            },
            errorCallback: function () {
                    paramObj.viewHistoryMescroll.endErr();
            }
        })
    }
    function reqHistoryData(params){
        let {url,data} = params;
            new Promise(function(resolve,reject){
                    $.ajax({
                        url:url,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authentication", paramObj.token);
                        },
                        data:{
                            pageNo:data.num,
                            pageSize:10,
                        },
                        success:function(result){
                            if(result.status === '200'){
                                let data = result.body.data;
                                resolve(data)
                            }else if(result.status==='201'){
                                resolve([]);
                            }else if(result.status==='400'){
                                dialogConfirm();
                                resolve([])
                            }else if(result.status==='500'){
                                reject('500 请求列表错误')
                            }else{
                                reject('请求列表错误')
                            }
                        },
                        error:function(err){
                            reject(err)
                        }
                    })
            }).then(function(data){
                    paramObj.viewHistoryMescroll.endSuccess()
                    params.successCallback(data)
            }).catch(function(err){
                    paramObj.viewHistoryMescroll.endSuccess()
                    params.successCallback([])
                    throw new Error(err)
            })
    }
    function drawViewHistory(data){
        let htmlStr = '';
        data.forEach(function(item,index){
            htmlStr+=`<li class="view_list">
                        <a href="./view_history_main.html?viewId=${item.viewId}">
                            <p class="view_con justify col_2_hide">${item.viewName}</p>
                            <span class="view_time">${item.startDate}</span>
                        </a>
                    </li>`
        })
        $("#view_history_ul").append(htmlStr)
    }
})