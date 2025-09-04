import { FiltersResponse } from "../types";

/**
 * Static filters derived from your rows:
 * 15970 Men Apparel Topwear Shirts Navy Blue Fall 2011 Casual ...
 * 59263 Women Accessories Watches Watches Silver Winter 2016 Casual ...
 * 21379 Men Apparel Bottomwear Track Pants Black Fall 2011 Casual ...
 * 53759 Men Apparel Topwear Tshirts Grey Summer 2012 Casual ...
 * 29114 Men Accessories Socks Socks Navy Blue Summer 2012 Casual ...
 * 18653 Men Footwear Flip Flops Flip Flops Black Fall 2011 Casual ...
 * 9204  Men Footwear Shoes Casual Shoes Black Summer 2011 Casual ...
 * 18461 Men Personal Care Fragrance Deodorant White Spring 2017 Casual ...
 * 48311 Women Accessories Jewellery Bracelet Bronze Winter 2012 Casual ...
 * 7990  Men Apparel Topwear Tshirts Navy Blue Fall 2011 Sports ...
 * 44970 Men Accessories Watches Watches White Winter 2016 Casual ...
 * 56489 Women Personal Care Nails Nail Polish Bronze Spring 2017 NA ...
 */

export function getStaticFilters(): FiltersResponse {
  return {
    groups: [
      {
        key: "gender",
        label: "Gender",
        options: [
          { id: "Men", label: "Men" },
          { id: "Women", label: "Women" },
        ],
      },
      {
        key: "masterCategory",
        label: "Master Category",
        options: [
          { id: "Apparel", label: "Apparel" },
          { id: "Accessories", label: "Accessories" },
          { id: "Footwear", label: "Footwear" },
          { id: "Personal Care", label: "Personal Care" },
        ],
      },
      {
        key: "subCategory",
        label: "Subcategory",
        options: [
          { id: "Topwear", label: "Topwear" },
          { id: "Bottomwear", label: "Bottomwear" },
          { id: "Socks", label: "Socks" },
          { id: "Watches", label: "Watches" },
          { id: "Fragrance", label: "Fragrance" },
          { id: "Nails", label: "Nails" },
          { id: "Flip Flops", label: "Flip Flops" },
          { id: "Shoes", label: "Shoes" },
          { id: "Jewellery", label: "Jewellery" }, // from "Accessories Jewellery Bracelet ..."
        ],
      },
      {
        key: "articleType",
        label: "Article Type",
        options: [
          { id: "Shirts", label: "Shirts" },
          { id: "Track Pants", label: "Track Pants" },
          { id: "Tshirts", label: "Tshirts" },
          { id: "Socks", label: "Socks" },
          { id: "Watches", label: "Watches" },
          { id: "Flip Flops", label: "Flip Flops" },
          { id: "Casual Shoes", label: "Casual Shoes" },
          { id: "Deodorant", label: "Deodorant" },
          { id: "Bracelet", label: "Bracelet" },
          { id: "Nail Polish", label: "Nail Polish" },
        ],
      },
      {
        key: "color",
        label: "Color",
        options: [
          { id: "Navy Blue", label: "Navy Blue" },
          { id: "Silver", label: "Silver" },
          { id: "Black", label: "Black" },
          { id: "Grey", label: "Grey" },
          { id: "Bronze", label: "Bronze" },
          { id: "White", label: "White" },
        ],
      },
      {
        key: "season",
        label: "Season",
        options: [
          { id: "Fall", label: "Fall" },
          { id: "Winter", label: "Winter" },
          { id: "Summer", label: "Summer" },
          { id: "Spring", label: "Spring" },
        ],
      },
      {
        key: "year",
        label: "Year",
        options: [
          { id: "2011", label: "2011" },
          { id: "2012", label: "2012" },
          { id: "2016", label: "2016" },
          { id: "2017", label: "2017" },
        ],
      },
      {
        key: "usage",
        label: "Usage",
        options: [
          { id: "Casual", label: "Casual" },
          { id: "Sports", label: "Sports" },
          { id: "NA", label: "NA" },
        ],
      },
    ],
  };
}
