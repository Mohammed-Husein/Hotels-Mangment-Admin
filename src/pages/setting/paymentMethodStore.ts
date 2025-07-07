import { useApi, usePagination } from "@/composables";
import { AddPaymentMethod, filterPaymentMethodDto, GetAllPaymentMethods } from "./api/dto";
import { PAYMENT_METHOD_API } from "./api/endpoint";

export const usePaymentMethodStore = defineStore("PaymentMethod", () => {
  const { GET, POST, DELETE, PUT } = useApi();

  const paymentMethodList = ref<GetAllPaymentMethods["paymentMethods"]>([]);
  const paymentMethodDetails = ref<AddPaymentMethod[]>([]);
  
  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };
  
  const paginationPaymentMethod = createPagination();

  // جلب جميع طرق الدفع
  async function GetAllPaymentMethods(Filters: filterPaymentMethodDto) {
    const response = await GET<any>(
      PAYMENT_METHOD_API.GetAll,
      {
        ...Filters,
        page: paginationPaymentMethod.value.currentPage,
        limit: paginationPaymentMethod.value.limit,
      },
      {},
      {}
    );

    paymentMethodList.value = response.data?.data.paymentMethods || [];
    paginationPaymentMethod.value.totalCount = response.data?.data.count || 0;
    paginationPaymentMethod.value.totalPages = Math.ceil((response.data?.data.count || 0) / paginationPaymentMethod.value.limit);
  }

  // إضافة طريقة دفع جديدة
  async function AddPaymentMethod(payload: any) {
   

    const response = await POST(
      PAYMENT_METHOD_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: true }
    );

    return response;
  }

  // جلب طريقة دفع بالمعرف
  async function GetPaymentMethodById(id: string) {
    const response = await GET<any>(
      `${PAYMENT_METHOD_API.GetAll}/${id}`,
      {},
      {},
      {}
    );
    const paymentMethod = response.data?.data.paymentMethod;
    if (paymentMethod) {
      paymentMethodDetails.value = {
        id: paymentMethod.id,
        nameAr: paymentMethod.name?.ar || "",
        nameEn: paymentMethod.name?.en || "",
        code: paymentMethod.code || "",
        descriptionAr: paymentMethod.description?.ar || "",
        descriptionEn: paymentMethod.description?.en || "",
        displayOrder: paymentMethod.displayOrder || 0,
        isActive: paymentMethod.isActive,
        icon: null
      };
    }
  }

  // تعديل طريقة دفع
  async function ModifyPaymentMethod(payload: any) {
    // إنشاء FormData لإرسال الملفات
    const formData = new FormData();
    
    // إضافة البيانات النصية
    if (payload.nameAr) formData.append('nameAr', payload.nameAr);
    if (payload.nameEn) formData.append('nameEn', payload.nameEn);
    if (payload.code) formData.append('code', payload.code);
    if (payload.descriptionAr) formData.append('descriptionAr', payload.descriptionAr);
    if (payload.descriptionEn) formData.append('descriptionEn', payload.descriptionEn);
    if (payload.displayOrder !== undefined) formData.append('displayOrder', payload.displayOrder.toString());
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive.toString());
    
    // إضافة الأيقونة إذا كانت موجودة
    if (payload.icon) {
      formData.append('icon', payload.icon);
    }

    const response = await PUT(
      `${PAYMENT_METHOD_API.Update}/${payload.id}`,
      formData,
      {
        error: true,
        success: "تمت العملية بنجاح",
      },
      { formData: true }
    );

    return response;
  }

  // حذف طريقة دفع
  async function DeletePaymentMethod(ids: string, itemName: string) {
    await DELETE(
      `${PAYMENT_METHOD_API.Delete}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف طريقة دفع ",
          text: `هل تريد بالتأكيد حذف طريقة الدفع (${itemName})؟`,
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    paymentMethodList.value = paymentMethodList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }

  return {
    paymentMethodList,
    paginationPaymentMethod,
    GetAllPaymentMethods,
    AddPaymentMethod,
    ModifyPaymentMethod,
    GetPaymentMethodById,
    paymentMethodDetails,
    DeletePaymentMethod,
  };
});
