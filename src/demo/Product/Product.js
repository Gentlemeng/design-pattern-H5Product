import $ from "jquery"
import StateMachine from "javascript-state-machine"
import getCart from "./../Cart/getCart"
class Product{
    constructor(data){
        this.data = data
        this.name = data.name
        this.timeLimit = data.typeUnitNames
        this.indexId = data.indexId||data.moduleCombineId
        this.unitid = data.unitId||data.typeUnitId
        this.backgroundImg = data.indexImageUrl||data.picUrl
        this.isBuy = data.isBuy
        this.cart = getCart();
    }
    init(){
        this.initContent(this.data);
    }
    initBtn($btn){
        let _this = this;
        let fsm = new StateMachine({
            init:"active",
            transitions:[{
                name:"addToCart",
                from:"active",
                to:"passive"
            },{
                name:"deleteFromCart",
                from:"passive",
                to:"active"
            }],
            methods:{
                onAddToCart:function(){
                    _this.addToCartHandle(_this.data);
                    updateState();
                },
                onDeleteFromCart:function(){
                    _this.deleteFromCartHandle(_this.indexId);
                    updateState();
                }
            }
        })
        updateState();
        function updateState(){
            if(fsm.state==="passive"){
                $btn.addClass("active").removeClass("passive");
            }else{
                $btn.addClass("passive").removeClass("active");
            }
        }
        $btn.click(function(){
            // console.log("aaa")
            if(fsm.is("active")){
                fsm.addToCart();
            }else{
                fsm.deleteFromCart();
            }
        })
    }
    addToCartHandle(data){
        this.cart.add(data);
    }
    deleteFromCartHandle(id){
        this.cart.del(id);
    }
}
export class BaseProduct extends Product{
    constructor(productList,data){
        super(data)
        this.productList = productList;
        this.type = "block";
        this.price = data.indexGoldCoinAttribute
        this.startColor = "#"+data.indexStartColor
        this.endColor = '#'+data.indexEndColor
    }
    initContent(){
        let startColor = this.startColor,endColor = this.endColor;
        let linearColor = `-webkit-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -moz-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -o-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -ms-linear-gradient(to left top, ${startColor}, ${endColor});
        background: linear-gradient(to left top, ${startColor}, ${endColor});
        background-color: ${startColor}`
        let productContent = $(`<li class="basic_product_list product_list ${this.isBuy=='Y'?'unclickable':''}" indexId="${this.indexId}" type="${this.type}" price="${this.price}">
                                <div class="product_top" style="${linearColor}">
                                    <div class="product_select_wrap">
                                        <div class="product_select"></div>
                                    </div>
                                    <div class="product_info">
                                        <img class="product_icon" src="${this.backgroundImg}"/>
                                        <div class="product_name">${this.name}</div>
                                    </div>
                                </div>
                                <div class="basic_price">
                                    ${this.price+'金币'+this.timeLimit}
                                </div>
                                <div class="product_layer" style="display:${this.isBuy=='N'?'none':'block'}"></div>
                            </li>`)
        this.initBtn(productContent);
        this.productList.productUl.append(productContent);

    }
}
export class CompositeProduct extends Product{
    constructor(productList,data){
        super(data)
        this.productList = productList;
        this.type = "group";
        this.price = data.totalPrice;
        this.save = data.freePrice;
        this.originTotalPrice = data.originTotalPrice;
    }
    initContent(){
        let productContent = $(`<li class="group_product_list product_list ${this.isBuy=='Y'?'unclickable':''}" type="group" indexId="${this.indexId}" 
                                price="${this.price}" save="${this.save}" unitId="${this.unitId}" originPrice="${this.originTotalPrice}">
                                    <div class="product_select_wrap">
                                        <div class="product_select"></div>
                                        <div class="group_img" style="background:url('${this.backgroundImg}') no-repeat center left/contain">
                                            <div class="product_layer"></div>
                                        </div>
                                    </div>
                                    <div class="group_info">
                                        <div class="group_name">${this.name}</div>
                                        <div class="group_price">${this.price+'金币'+this.timeLimit}</div>
                                        <div class="group_save">(可节省${this.save}金币)</div>
                                    </div>
                                </li>`)
        this.initBtn(productContent);
        this.productList.productUl.append(productContent);
    }
}