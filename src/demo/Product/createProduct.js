import { BaseProduct } from "./Product";

// import 
//工厂模式  创建product
export default function createProduct(productList,data){
    let product = new BaseProduct(productList,data,"basic_product_list");
    product.init();
}