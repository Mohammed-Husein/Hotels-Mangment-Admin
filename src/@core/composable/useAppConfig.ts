// ! DONT TOUCH THIS FILE

import { HOST_DOMAIN } from '@/../app.config'
import { ref } from 'vue'

export const useAppConfig = () => {
  const hostDomain = ref(HOST_DOMAIN)

  const fileUrl = (url: string) => `${hostDomain.value}/${url}`

  return { hostDomain, fileUrl}
}
