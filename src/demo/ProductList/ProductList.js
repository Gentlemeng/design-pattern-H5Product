import $ from "jquery"
import { GET_DISCOUNT, GET_BASEPRODUCT, GET_COMPOSITEPRODUCT } from "../config/config";
import createProduct from "../Product/createProduct";
class ProductList{
    constructor(sale,className,title){
        this.sale = sale;
        this.$el = $(`<div class="${className}"></div>`)
        this.title = title;
    }
    init(){
        this.render();
    }
}
export class BaseList extends ProductList{
    constructor(sale,className,title){
        super(sale,className,title)
        this.discount;
        this.disCondition;
        this.productUl = $(`<ul class="basic_product_ul"></ul>`)
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
                
                createProduct(this,productData,"baseProduct");
            });
            this.$el.append(this.productUl)
        }
    }
    render(){
        //请求title相关
        this.loadDiscount().then(data=>{
            if(data.length){
                this.discount = data[0].discountCost;
                this.disCondition = data[0].discountNum;
            }
            this.initTitle();
        }).then(()=>{
           //请求基础数据相关
            this.loadProduct().then(data=>{
                this.initProductList(data);
            }) 
        })
        
        this.sale.$el.append(this.$el);
    }
}

export class CompositeList extends ProductList{
    constructor(sale,className,title){
        super(sale,className,title)
        this.productUl = $(`<ul class="group_product_ul"></ul>`)
    }
    initTitle(){
        let title = $(`<div class="module_title">${this.title}</div>`)              
        this.$el.append(title);
    }
    loadProduct(){
        return fetch(GET_COMPOSITEPRODUCT).then(data=>{
            if(data.ok){
                return data.json();
            }
        })
    }
    initProductList(data){
        if(data.length){
            //创建一个product  然后init
            data.forEach(productData => {
                createProduct(this,productData,"compositeProduct");
            });
            this.$el.append(this.productUl)
        }
    }
    render(){
        this.initTitle();
        //请求基础数据相关
        this.loadProduct().then((data)=>{
            this.initProductList(data);
        })
        
        this.sale.$el.append(this.$el);
    }
}

