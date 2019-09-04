import { BaseProduct, CompositeProduct } from "./Product";

// import 
//工厂模式  创建product
export default function createProduct(productList,data,type){
    let product
    //根据type 创建相应的产品类
    if(type==="baseProduct"){
        product = new BaseProduct(productList,data);
    }else{
        product = new CompositeProduct(productList,data)
    }
    product.init();
}