export interface BreadCrumbItem {
  text: string
  icon: string
  isActive?: boolean
  path?: string
}
export interface PageMeta {
  title: string;
  icon: string;
  subTitle?: string;
  breadCrumb: BreadCrumbItem[];
}
