$(function () {
    let paramObj = {
        url: newCmsUrl,
        viewId: function () {
            let viewId = parseURL(window.location.href).viewId;
            return viewId
        }(),
        mescroll: {
            viewMescroll: null
        },
        token: ''
    }
    let viewId = paramObj.viewId;
    //只有当viewId有值时，才往下执行
    if (viewId) {
        //获取token
        var sessionData = sessionStorage.getItem("Authentication");
        if (sessionData != null && JSON.parse(sessionData).data != undefined) {
            paramObj.token = JSON.parse(sessionData).data;
        }
        new Promise(function (resolve, reject) {
            $.ajax({
                url: paramObj.url + 'view/viewDetail',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    viewId: viewId
                },
                success: function (result) {
                        if(result.status === '200'){
                            resolve(result.body)
                        }else if(result.status==='201'){
                            reject(result.msg);
                        }else if(result.status==='301'){
                            reject(result.msg)
                        }else if(result.status==='400'){
                            dialogConfirm();
                            // reject(null)
                        }else if(result.status==='500'){
                            reject('500 请求错误')
                        }else{
                            reject('请求错误')
                        }
                },
                error: function (err) {
                    reject(err)
                }
            })
        }).then(function (data) {
            // console.log(data);
            drawViewMain(data);
        }).catch(function (err) {
            throw Error(err)
        })
        paramObj.mescroll.viewMescroll = new MeScroll("viewPoint", {
            down: {
                use: false
            },
            up: {
                callback: viewCallback, //上拉加载的回调
                // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                page: {
                    num: 0,
                    size: 8
                },
                clearEmptyId: "answerUl",
                htmlNodata: '<p class="upwarp-nodata">无更多留言</p>',
                noMoreSize: 1,
                empty: {
                    tip: "无更多留言" //提示
                },
                lazyLoad: {
                    use: true
                }
            }
        })
    }
    function drawViewMain(viewObj){
        let {viewId,content,startDate,attitude,image_url} = viewObj;
        let {hasOption} = attitude;
        $(".view_current").html(startDate)
        if (image_url) {
            $(".view_main").css({ "background": `url("${image_url}") no-repeat center/cover` });
        } else {
            //无图片时，显示静态图片
            $(".view_main").css({ "background": `url("./../assets/images/participation/view_bg.jpg") no-repeat center/cover` });
        }
        $(".expert_view_txt").attr({ "id": viewId }).html(content);
        showViewOpinion(attitude);
        if(!hasOption){
            $(".my_opinion").hide();
        }
    }
    // 上拉加载入口
    function viewCallback(page) {
        //联网加载数据
        getViewComment({
            // url:paramObj.questionListUrl,
            num: page.num,
            size: page.size,
            successCallback: function (curPageData) {
                paramObj.mescroll.viewMescroll.endSuccess(curPageData.length);

                addViewCommentData(curPageData, page.num);
            },
            errorCallback: function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.viewMescroll.endErr();
            }
        });
    }
    //"观点拉锯战"-请求用户留言列表
    function getViewComment(param) {
        $.ajax({
            url: paramObj.url + "comment/onlyComment",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            type: "get",
            data: {
                infoId: viewId,
                pageNo:param.num,
                pageSize:param.size
            },
            success: function (result) {
                if (result.success) {
                    paramObj.mescroll.viewMescroll.endSuccess();
                    var questionInfo = result.comment;
                    param.successCallback(questionInfo);
                }
                // token检验失败
                else if (result.msg == "ARGSERROR" || result.msg == "USERERROR") {
                    $(".no_sign_in").show();
                    paramObj.mescroll.viewMescroll.destroy();
                }
            },
            error: function (err) {
                param.errorCallback();
                dialogAlert(`请求用户留言数据失败，请稍后重试。`);
            }
        })
    };
    function addViewCommentData(listData) {
        var answerStr = '';
        // <img class="user_status" style="display:${list.userCardUrl?'inline-block':'none'}" src="${list.userCardUrl?list.userCardUrl:''}"/>
        // <img class="user_status" src="./../assets/images/user_status.gif"/>
        // <img class="user_avatar" src="${list.user.userHeadImage}"/>
        // var commentIds = [];
        listData.forEach(function (list) {
            var userCardUrl = list.userCardUrl;
            answerStr += `<li class="answer_list comment_list" id="${list.comment.commentId}">
                            <div class="answer_user comment_handle_wrap">
                                <div class="comment_user">
                                    <div class="user_avatar" style="background:url(${list.user.userHeadImage}) no-repeat center/contain"></div>
                                    <div class="user_name_wrap">
                                        <span class="user_name col_1_hide">${list.user.userNickName}</span>
                                        <img class="user_status" style="display:${userCardUrl ? 'inline-block' : 'none'}" src="${userCardUrl ? userCardUrl : ''}"/>
                                    </div>
                                </div>
                            </div>
                            <div class="answer_con">
                                <p class="answer_txt justify">${list.comment.commentContent}</p>
                            </div>
                            <div class="answer_handle">
                                <div class="answer_attitude" parent_id="${list.comment.commentId}">
                                    <span class="hand like" parent_id="${list.comment.commentId}"></span>
                                    <i class="like_num">${list.comment.likeCount || 0}</i>
                                    <span class="hand dislike" parent_id="${list.comment.commentId}"></span>
                                    <i class="dislike_num">${list.comment.againstCount || 0}</i>
                                </div>
                            </div>
                            <div class="answer_response">
                                <ul class="answer_response_ul">
                                </ul>
                            </div>
                        </li>`
        })
        $(".viewpoint .answer_ul").append(answerStr);
        //判断是否可以进行点赞或踩操作
        // listData.forEach(function (list, index) {
        //     //之前已经没有进行操作
        //     if (list.attitude == null) {
        //         praiseOneClick({
        //             id: list.comment.commentId, //留言id
        //             periodId: viewId,
        //             index: index, //问题回复索引
        //             className: ".answer_attitude", //点赞\踩的直接父级className
        //             url: paramObj.url + "support/save", //url
        //             token: paramObj.token
        //         });
        //     }
        //     //用户之前点击了赞
        //     else if (list.attitude == "like") {
        //         $(`.answer_attitude[parent_id=${list.comment.commentId}]`).find(".like").toggleClass("like").toggleClass("like_active")
        //     }
        //     //用户之前点击了踩
        //     else if (list.attitude == "against") {
        //         $(`.answer_attitude[parent_id=${list.comment.commentId}]`).find(".dislike").toggleClass("dislike").toggleClass("dislike_active")
        //     }
        // })
    }
})