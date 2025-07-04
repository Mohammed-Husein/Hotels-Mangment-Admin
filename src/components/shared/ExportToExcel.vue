<template>
  <VBtn @click="handleClick" color="#C9A85929" class="mx-1 text-[#C9A859]" >
    تصدير Excel <VIcon class="p-1">tabler-file-export</VIcon>
  </VBtn>
</template>

<script setup lang="ts">
import { useApi } from "@/composables";
import { defineProps } from "vue";
import { useI18n } from "vue-i18n"; // Ensure useI18n is imported
import { useToast } from "vue-toastification";

const { locale, t } = useI18n();

// Define props with TypeScript interface for better type safety
interface ExportProps {
  url: string;
  ids: string[];
  idsKey: string; // New prop for the key name
  pageName: string;
}

const props = defineProps<ExportProps>();
const toast = useToast();

// Import the POST function from useApi composable
const { POST } = useApi();

// Handle the click event
const handleClick = () => {
  // Check if idsKey is empty or ids array is empty
  if (!props.idsKey || !props.ids.length) {
    // Display appropriate error message
    if (locale.value === "en") {
      toast.error("Please select items to export.");
    } else if (locale.value === "ar") {
      toast.error("يرجى تحديد عناصر لتصدير.");
    }
    return; // Prevent further execution if no ids or idsKey
  }

  ExportToExcelWarehouse();
};

// Async function to handle the export to Excel
const ExportToExcelWarehouse = async () => {
  try {
    // Build the request body with dynamic key name
    const requestBody = {
      [props.idsKey]: props.ids, // Use dynamic key name
    };

    // Make the POST request to fetch the Excel file
    const response = await POST(props.url, requestBody, undefined, {
      responseType: "blob",
    });

    // Create a new Blob from the response
    const blob = new Blob([response.data], {
      type:
        response.headers["content-type"] ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    console.log(blob);
    // Generate a file name with the current date
    const fileName = `${props.pageName}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // Create a link element to trigger the file download
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    // Log the error and provide user feedback
    console.error("Export error:", error);
    if (locale.value === "en") {
      toast.error("Please select items to complete the process...");
    } else if (locale.value === "ar") {
      toast.error("يرجى تحديد عناصر لاتمام العملية");
    }
  }
};
</script>
