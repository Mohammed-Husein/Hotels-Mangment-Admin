<template>
  <VBtn @click="handleClick" color="#C9A85929" class="mx-1 text-[#C9A859]">
    تحميل PDF <VIcon class="p-1">tabler-file-upload</VIcon>
  </VBtn>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps } from "vue";
import { useApi } from "@/composables";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n"; // Make sure to import useI18n

const { locale, t } = useI18n();
// Define props with TypeScript interface for better type safety
interface ExportProps {
  url: string;
  ids: string[];
  query: string;
  pageName: string;
}

const props = defineProps<ExportProps>();
const toast = useToast();

// Define reactive properties
const queryString = ref("");

// Import the POST function from useApi composable
const { POST } = useApi();

// Handle the click event
const handleClick = () => {
  // Check if ids is empty
  if (!props.ids.length) {
    // Display appropriate error message
    if (locale.value === "en") {
      toast.error("Please select items to upload.");
    } else if (locale.value === "ar") {
      toast.error("يرجى تحديد عناصر للتحميل.");
    }
    return; // Prevent further execution if no ids
  }

  ExportToPDFWarehouse();
};

// Async function to handle the export to PDF
const ExportToPDFWarehouse = async () => {
  try {
    // Build the request body with ids
    const requestBody = {
      ids: props.ids,
    };

    // Make the POST request to fetch the PDF file
    const response = await POST(props.url, requestBody, undefined, {
      responseType: "blob",
    });

    // Create a new Blob from the response
    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    // Generate a file name with the current date
    const fileName = `${props.pageName}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

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
