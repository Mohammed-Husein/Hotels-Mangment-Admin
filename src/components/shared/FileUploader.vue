<script setup lang="ts">
import { useFile, type FileType } from "@core/composable/useFile";
import { hasOwn, isArray } from "@vue/shared";
import Compressor from "compressorjs";
import { v4 as uuid } from "uuid";
import VuePictureCropper, { cropper } from "vue-picture-cropper";

import Upload from "../icons/Upload.vue";
import DeleteFile from "../icons/DeleteFile.vue";
import Expand from "../icons/Expand.vue";

interface fileDto {
  file: File | undefined;
  url: string;
  id: string;
  type: FileType;
}
interface UrlDto {
  url: string;
  fileType: FileType;
}
type errorType = {
  fileName?: string;
  errorType: "maxSize" | "maxWidth" | "maxHeight" | "maxCount";
  message: string;
} | null

// Props

type propsType = {
  url?: string | string[];
  base64?: boolean;
  quality?: number;
  contain?: boolean;
  cover?: boolean;
  accept?: "audio/*" | "video/*" | "image/*" | string;
  deleteBtnClass?: string;
  previwerContainerClass?: string;
  previwerItemClass?: string;
  previewImageClass?: string;
  file?: File | null;
  maxSize?: number;
  label?: string;
  placeholder?: string;

  maxWidth?: number;
  maxHeight?: number;
  maxCount?: number;
  deleteUrlBtn?: boolean;
  downloadBtn?: boolean;
  openBtn?: boolean;
  modelValue?: File | File[] | null;
  deletedUrls?: string[];
}

const props = withDefaults(defineProps<propsType>(), {
  base64: false,
  contain: true,
  cover: false,
  deleteBtnClass: "",
  deletedUrls: () => [],
  file: null,
  accept: '*/*',
  quality: 1,
  deleteUrlBtn: true,
  downloadBtn: false,
  openBtn: true,
  maxSize: 10,
  placeholder: "Click Or Drop File Here",

});

//Emits
const emit = defineEmits<{
  (e: "update:url", url?: string | string[]): void;
  (e: "update:deletedUrls", urls: string[]): void;
  (e: "validationError", error: errorType): void;
  (e: "update:modelValue", files: File | File[] | null | any): void;
}>();
// Bindings
const { getFileExt, getFileType, downloadFile, getFileUrl } = useFile();
const attrs = useAttrs();
// State
const fileInput = ref<HTMLInputElement | null>(null);
const id = Date.now() * (Math.random() * 10000);
const localFiles = ref<fileDto[]>([]);
const localUrls = ref<string[]>([]);
const deletedUrls = ref<string[]>([]);
const isShowModal = ref<boolean>(false);
const currentFileID = ref<string>("");
const error = ref<null | errorType>();
const pic = ref("");
const result = ref({
  dataURL: "",
  blobURL: "",
});

// Getters
const isMulti = computed(() => hasOwn(attrs, "multiple"));
const modelValue = computed(() => props.modelValue);
// Functions
function showUploadFileWindow() {
  console.log("test");

  if (fileInput.value) {
    fileInput.value.click();
  }
}
function getExt(filename: string) {
 
    var ext = filename.split('.').pop();
    console.log( ext)
    console.log( filename)
    if(ext == filename) return "text";
    return ext;
}



function compressFile(file: File) {
  return new Promise<File>((resolve, reject) => {
    // eslint-disable-next-line no-new
    new Compressor(file, {
      quality: props.quality,
      success(result) {
        resolve(
          new File([result], file.name, {
            lastModified: new Date().getTime(),
            type: result.type,
          })
        );
      },
      error(err) {
        reject(err);
      },
    });
  });
}
function reset() {
  localFiles.value = [];
}
function deleteFile(e: any, fId: string) {
  e.stopImmediatePropagation();

  localFiles.value = localFiles.value.filter((f) => {
    if (f.id === fId) URL.revokeObjectURL(f.url);

    return f.id !== fId;
  });
  uploadEvent();
}
function isImgExt(filename: string) {
    if(filename.includes("blob")) return true;
    var ext = filename.split('.').pop();
    if(ext == filename) return "";
    console.log(ext);
    switch(ext?.toLowerCase()) {
       case "jpg" :
       return true;
       case "png" :
       return true;

       case "jpeg" :
       return true;      
        case "jif" :
       return true;      
        case "jfif" :
       return true;

       case "svg" :
       return true;
       case "gif" :
       return true;

       case "ico" :
       return true;

       case "bmp" :
       return true;      
        case "tiff" :
       return true;
       case "webp" :
       return true;
       case "jiff" :
       return true;
      
   
       
       case "tif" :
       return true;

      default : return false;

    }
 
}
const toMb = (fileSize: number) => fileSize / 1000000;

function resetValidation() {
  error.value = null
  emit("validationError", null);
}

async function validateFile(file: File) {
  console.log(props.maxSize, toMb(file.size));
  if (props.maxSize && (props.maxSize >= toMb(file.size))) {
    resetValidation();
    return Promise.resolve();
  } else {
    error.value = {
      errorType: "maxSize",
      message: `You Can't Upload Bigger Than (${props.maxSize})(MB) files`,
    }
    emit("validationError", error.value);
    return Promise.reject({
      fileName: file.name,
      errorType: "maxSizeError",
      message: `The file (${file.name}) size is larger than the allowed size  (${props.maxSize} mb)`,
    });
  }
}
function cropImageUrl(e: any, file: any) {
  e.stopImmediatePropagation();
  e.preventDefault();
  console.log("localFiles",localFiles.value[0]);
  console.log("localFiles",localUrls.value[0]);

  // Reset last selection and results
  pic.value = "";
  result.value.dataURL = "";
  result.value.blobURL = "";
  currentFileID.value = localFiles.value[0].id;
  pic.value = localFiles.value[0].url;
  isShowModal.value = true;

  // uploadEvent();
}
function cropImage(e: any, file: fileDto) {
  e.stopImmediatePropagation();
  e.preventDefault();

  // Reset last selection and results
  pic.value = "";
  result.value.dataURL = "";
  result.value.blobURL = "";

  currentFileID.value = file.id;
  pic.value = file.url;
  isShowModal.value = true;

  // uploadEvent();
}
async function setFiles(filesList: FileList) {
  if (props.maxCount && filesList.length + localFiles.value.length > props.maxCount) {
    error.value = {
      errorType: "maxCount",
      message: `You Can't Upload More Than (${props.maxCount}) files`,
    }
    emit("validationError", error.value);
    return;
  }


  for (let file of filesList) {

    validateFile(file)
      .then(async () => {
        const fileType = getFileType(getFileExt(file.name));

        if (fileType === "image" && getFileExt(file.name) !== "svg") {
          console.error(fileType);
          try {
            file = await compressFile(file);
          } catch (er) {
            console.error(er);
          }
        }

        if (!isMulti.value) {
          localFiles.value = [];
          localUrls.value = [];
        }

        localFiles.value.push({
          file,
          id: uuid(),
          type: fileType,
          url: URL.createObjectURL(file),
        })
        uploadEvent();

      }).catch((error) => {
        uploadEvent();

        console.log('error', error)
        emit("validationError", error);

      });


  }
}
function uploadEvent() {
  if (isMulti.value) {
    emit("update:modelValue", localFiles.value.map(({ file }) => file)
    );
    console.log('emit',localUrls.value)
    console.log('emit',localFiles.value)
    console.log('emit', [...localUrls.value,...localFiles.value.map(({ url }) => url)])

    // emit( 
    //   "update:url",
    //   [...localUrls.value,...localFiles.value.map(({ url }) => url)]
    // );
  } else {
    console.log('emit',localUrls.value)
    console.log('emit',localFiles.value)
    emit(
      "update:modelValue",
      localFiles.value.length ? localFiles.value[0].file : null
    );
    emit("update:url", 
     
    localUrls.value.length ? 
    localUrls.value[0] : ''   
);
  }
}
function clickHandler(e: any) {
  const filesList: FileList = e.target.files;

  setFiles(filesList);
}
function dropHandler(ev: any) {
  ev.preventDefault();

  const tempFiles = ev.dataTransfer.files;

  setFiles(tempFiles);
}
function dragOverHandler(ev: any) {
  ev.preventDefault();
}
/**
 * Clear the crop box
 */
function clear() {
  if (!cropper) return;
  cropper.clear();
}
/**
 * Reset the default cropping area
 */
function resetCrop() {
  if (!cropper) return;
  cropper.reset();
}

/**
 * Get cropping results
 */
async function getResult() {

  if (!cropper) return;
  const base64 = cropper.getDataURL();
  const blob: Blob | null = await cropper.getBlob();
  if (!blob) return;
  const file = await cropper.getFile({
    fileName: "cropped.png",
  });
   var filename = new File([blob], 'cropped_file.png', {type: blob.type});


  console.log({ base64, blob, file,filename });


  isShowModal.value = false;


  const croppedFile = localFiles.value.find(f => f.id === currentFileID.value)
  if (file && croppedFile) {

    croppedFile.file = filename
    croppedFile.url = base64
  }
  uploadEvent()
}

const blobToFile = (theBlob: Blob, fileName: string): File => {
  var b: any = theBlob;
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date();
  b.name = fileName;

  //Cast to a File() type
  return <File>theBlob;
};
function deleteUrl(e: any, url: string) {
  e.stopImmediatePropagation();
  deletedUrls.value.push(url);
  localUrls.value = localUrls.value.filter((u) => u !== url);
  emit("update:deletedUrls", deletedUrls.value);
  emit("update:url",
  [...localUrls.value,...localFiles.value.map(({ url }) => url)]
  
  
 );
}

const urls = computed(() => props.url);

watch(urls, (nv: any) => {
  initUrls(nv);
});
function initUrls(payload: string | string[] | undefined) {
  if (payload) {
    localUrls.value = [];
    if (typeof payload === "string")
    localUrls.value.push(payload);
    else if (Array.isArray(payload))
      payload.forEach((u) => {
        localUrls.value.push(u);
      
    
      });

    // localUrls.value = [,,,payload.map(u => ({}))];
  }
}

 
function initialize() {
  console.log("initializing...",props);

  initUrls(props.url);
 
}
function getUrl(url: string) {
  return new URL(url, import.meta.url).href;
}

watch(
  modelValue,
  (nv) => {
    console.log("model Value Change", nv);

    if (nv === null || (isArray(nv) && nv.length === 0)) reset();
  },
  { deep: true }
);

defineExpose({
  reset,
});

initialize();
</script>

<template>
 
  <div class="ez-uploader">
    <button type="button" class="ez-uploader-btn" @click="showUploadFileWindow" @drop="dropHandler"
      @dragover="dragOverHandler">
      <slot>
        <span class="placeholder"> Click Or Drop File Here </span>
        <!-- <img src="@/assets/upload-1.svg?url" height="45" alt=""> -->
        <Upload class="upload-icon" height="45" width="45"></Upload>
      </slot>
      <div class="ez-uploader-preview" style="max-height: 100% !important"
        :class="[{ multi: isMulti }, previwerContainerClass]">
 
        <div v-for="(src, i) in localUrls" :key="i" class="ez-uploader-preview-item" :class="previwerItemClass">
   
          <img  
          :key="src"
          :src="isImgExt(src)? getFileUrl(src) : `/icons/${getExt(src)}.png` "
          :class="previewImageClass" class="preview-img" />

          <div class="preview-item-overlay">
            <div class="action-btns">
              <a :id="`delete-btn-${i}`" class="action-btn" :class="deleteBtnClass" @click="deleteUrl($event, src)">
                <slot name="delete-btn">
                  <DeleteFile height="20" />
                </slot>
              </a>
           
              <button v-if="downloadBtn" :id="`delete-btn-${i}`" :class="deleteBtnClass" class="action-btn" @click="
                $event.stopImmediatePropagation();
              downloadFile(src);
              ">
                <slot name="delete-btn">
                  <!-- <img height="30" src="~assets/svg/qr/qr-download.svg" /> -->
                  <!-- <Download></Download> -->
                </slot>
              </button>

              <a v-if="openBtn" target="_blank" :href="getFileUrl(src)" :id="`delete-btn-${i}`"
                @click="$event.stopImmediatePropagation()" :class="deleteBtnClass" class="action-btn">
                <Expand height="20" />
              </a>
            </div>
          </div>
        </div>
 
        <div v-for="(file, i) in localFiles" :key="file.id" class="ez-uploader-preview-item" :class="previwerItemClass">
          <img class="preview-img" :src="file.type != 'image' ?  `/icons/${file.type}.png` : file.url "
            :class="previewImageClass" />
          <div class="preview-item-overlay">
            <div v-if="file.file" class="info">
              <slot name="info-overlay">
                <h6 style="font-weight: bold">{{ file.file.name }}</h6>
                <span>Type : {{ file.type }}</span>
                <span>Size : {{ (file.file.size / 1000000).toFixed(2) }}mb</span>
              </slot>
            </div>
            <div class="action-btns">
              <button :id="`delete-btn-${i}`" :class="deleteBtnClass" class="action-btn"
                @click="deleteFile($event, file.id)">
                <DeleteFile height="30" src="@/assets/delete-file.svg?url" />
              </button>
              <button :id="`crop-btn-${i}`" :class="deleteBtnClass" class="action-btn" @click="cropImage($event, file)">
                <v-icon> mdi-crop </v-icon>
              </button>
              <a v-if="openBtn" target="_blank" :href="file.url" :id="`delete-btn-${i}`" :class="deleteBtnClass"
                class="action-btn" @click="$event.stopImmediatePropagation()">
                <Expand height="20" src="@/assets/expand.svg?url" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </button>
    <div class="text-error" v-if="error">
      {{ error?.message }}
    </div>
    <input :accept="accept" :id="`file-uploader-${id}`" ref="fileInput" v-bind:="$attrs" type="file" hidden
      @change="clickHandler" />
    <v-dialog width="900px" v-model="isShowModal" transition="dialog-bottom-transition">
      <VCard>
        <header class="tw-flex tw-items-center tw-justify-between tw-p-2 tw-flex-col md:tw-flex-row">
          <VCardTitle>Crop Image</VCardTitle>
          <div class="tools tw-flex tw-gap-2">
            <VBtn variant="flat" color="dark" prepend-icon="mdi-refresh" @click="resetCrop">Reset</VBtn>
            <VBtn variant="flat" color="dark" prepend-icon="mdi-check" @click="getResult">Crop</VBtn>
            <VBtn variant="flat" color="dark" prepend-icon="mdi-cancel" @click="isShowModal = false">Cancel</VBtn>
          </div>
        </header>


        <VCardText>
       
            <VuePictureCropper v-if="localFiles.length" :boxStyle="{
              width: '100%',
              height: '100%',
              margin: 'auto',
            }" :img="pic" :options="{
  viewMode: 1,
  dragMode: 'crop',
}" />
   


        </VCardText>
      </VCard>
    </v-dialog>
  </div>
 


</template>

<style scoped lang="scss">
.ez-uploader {
  width: 100%;

  &-btn {
    width: 100%;
    outline: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5px;
    background-color: transparent;
    border: 1px dashed #acacac;
    color: #acacac;
    padding: 0.4rem;
    cursor: pointer;
    transition: 0.5s;

    .upload-icon {
      transition: 0.5s;
      stroke: #acacac;
    }

    &:hover {
      border-color: #777;
      color: #777;

      .upload-icon {
        stroke: #777;
      }
    }

    .placeholder {
      font-size: 14px;
      font-weight: bold;
      margin: 5px 0;
    }
  }
}

.ez-uploader-preview {
  max-height: 350px;
  overflow: hidden;

  * {
    font-family: sans-serif;
  }

  &-item {
    position: relative;

    .preview-img {
      width: 100%;
      max-height: 200px;
      border-radius: 0.5rem;
    }

    .preview-item-overlay {
      position: absolute;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      opacity: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      top: 0;
      background-color: rgba(36, 36, 36, 0.729);
      transition: 0.5s;
      border-radius: 0.4rem;

      .info {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 10px;

        h6 {
          font-weight: bold;
          color: white;
          margin: 0;
          text-align: left;
          font-size: 16px;
        }

        span {
          text-align: initial;
          color: #ffffff;
          font-size: 15px;
        }
      }
    }

    &:hover {
      .preview-item-overlay {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  &.multi {
    display: grid;
    position: relative;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;

    .preview-img {
      height: 150px;
      object-fit: contain;
      border-radius: 0.5rem;
    }

    .info {
      span {
        font-size: 12px;
      }
    }
  }

  .action-btns {
    position: absolute;
    bottom: 2px;
    display: flex;
    justify-content: space-evenly;
    width: 100%;

    .action-btn {
      border-radius: 5px;
      bottom: 0;
      align-self: center;
      color: white;
      background-color: transparent;
      border-radius: 50%;
      border: 0;
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        height: 24px;
      }

      &:hover {
        background-color: #ffffff26;
      }

      svg {
        height: 4rem;
      }
    }
  }
}
</style>
