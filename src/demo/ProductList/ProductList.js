import $ from "jquery"
import { GET_DISCOUNT, GET_BASEPRODUCT } from "../config/config";
import createProduct from "../Product/createProduct";

class ProductList{
    constructor(className,title){
        this.$el = $(`<div class="${className}"></div>`)
        this.title = title;
    }
}
export class BaseList extends ProductList{
    constructor(sale,className,title){
        super(className,title)
        this.sale = sale;
        this.title = title;
        this.discount;
        this.disCondition;
        this.productUl = $(`<ul class="basic_product_ul"></ul>`)
    }
    init(){
        this.render();
    }
    initTitle(){
        let title = $(`<div class="module_title">${this.title}</div>`)
        let discountInfo = $(`<div class="discount_info">
                                <div class="discount_icon">${this.discount}折</div>
                                <div class="discount_condition">任选${this.disCondition}件打${this.discount}折</div>
                                <div class="discount_flag"></div>
                            </div>`)                            
        this.$el.append(title);
        this.$el.append(discountInfo);
    }
    loadDiscount(){
        //请求打折信息
        return fetch(GET_DISCOUNT).then(data=>{
            // debugger;
            if(data.ok){
                return data.json();
            }
        })
    }
    loadProduct(){
        return fetch(GET_BASEPRODUCT).then(data=>{
            if(data.ok){
                return data.json();
            }
        })
    }
    initProductList(data){
        if(data.length){
            //创建一个product  然后init
            data.forEach(productData => {
                createProduct(this,productData);
            });
        }
    }
    render(){
        //请求title相关
        this.loadDiscount().then(data=>{
            if(data.length){
                this.discount = data[0].discountCost;
                this.disCondition = data[0].discountNum;
            }
        }).then(()=>{
            this.initTitle();
        })
        //请求基础数据相关
        this.loadProduct().then(data=>{
            this.initProductList(data);
            this.$el.append(this.productUl)
        })
        this.sale.$el.append(this.$el);
    }
}
export class CompositeList extends ProductList{  
    constructor(sale,className,title){
        super(className,title)
        this.sale = sale;
    }  
}