import $ from "jquery"
import getCart from "./../Cart/getCart"
class Product{
    constructor(data,className){
        this.$el = $(`<li class="${className} product_list"></li>`)
        this.data = data
        this.name = data.name
        this.timeLimit = data.typeUnitNames
        this.indexId = data.indexId
        this.unitid = data.typeUnitId
        this.backgroundImg = data.indexImageUrl
        this.cart = getCart();
        // this.cart.init();
    }
}
export class BaseProduct extends Product{
    constructor(productList,data,className){
        super(data,className)
        this.productList = productList;
        this.type = "block";
        this.price = data.indexGoldCoinAttribute
        this.startColor = "#"+data.indexStartColor
        this.endColor = '#'+data.indexEndColor
        this.isBuy = data.isBuy
    }
    init(){
        this.initContent(this.data);
        this.render();
    }
    initContent(data){
        this.$el.attr({
            "indexId":this.indexId,
            "type":this.type,
            "price":this.price,
            "unitid":this.unitid
        })
        let startColor = this.startColor,endColor = this.endColor;
        let linearColor = `-webkit-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -moz-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -o-linear-gradient(to left top, ${startColor}, ${endColor});
        background: -ms-linear-gradient(to left top, ${startColor}, ${endColor});
        background: linear-gradient(to left top, ${startColor}, ${endColor});
        background-color: ${startColor}`
        let productContent = $(`<div class="product_top" style="${linearColor}">
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
                            <div class="product_layer" style="display:${this.isBuy=='N'?'none':'block'}"></div>`)
        // console.log(data);
        this.$el.append(productContent);
    }
    initBtn(){

    }
    select(){

    }
    unselect(){

    }
    render(){
        this.productList.productUl.append(this.$el)
    }
}