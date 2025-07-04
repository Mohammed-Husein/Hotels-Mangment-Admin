export class HomaDto {
  numberOfProudctsAdded = {
    numberOfProducts: 0,
    lastXMonths: [] as lastMonth[],
  };
  numberOfInboundProcesses = {
    numberOfProducts: 0,
    lastXMonths: [] as lastMonth[],
  };
  numberOfOutboundProcesses = {
    numberOfProducts: 0,
    lastXMonths: [] as lastMonth[],
  };
  numberOfOutOfStockProducts = {
    numberOfProducts: 0,
    lastXMonths: [] as lastMonth[],
  };
  productsByWarehouses: ProductWarehouse[] = [];
  productsByCategories: ProductCategories[] = [];
}

export class LowStockDto {
  count = 0;
  products: Products[] = [];
}

export class lastMonth {
  dateOnly = "";
  count = 0;
}

export class ProductWarehouse {
  warehouseId = "";
  warehouseName = "";
  ratio = 0;
}

export class ProductCategories {
  categoryId = "";
  categoryName = "";
  numberOfProducts = 0;
}

export class Products {
  productId = "";
  code = "";
  name = "";
  defaultImage = "";
  currentQuantity = 0;
  priority = "";
}

export class GeneralSearchDto {
  employeeCount = 0;
  employees = [
    {
      employeeId: "",
      fullName: "",
      email: "",
    },
  ];
  productCount = 0;
  products = [
    {
      productId: "",
      productName: "",
      code: "",
    },
  ];
  categoryCount = 0;
  categories = [
    {
      categoryId: "",
      categoryName: "",
      parentCategoryName: "",
      code: "",
    },
  ];
  orderCount = 0;
  orders = [
    {
      orderId: "",
      number: "",
      employeeName: "",
    },
  ];
}

export class GetHomeSearchPageDto {
  EmployeePageIndex = 1;
  ProductPageIndex = 1;
  OrderPageIndex = 1;
  CategoryPageIndex = 1;
}
