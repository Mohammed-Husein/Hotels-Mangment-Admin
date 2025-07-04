export interface ResidentialAddress {
  street: string
  details: string
  floor: number
  building: string
}
export interface DormitoryAddress {
  numberNum: string
  roomNum: string
}
export interface Address {
  id: string
  name: string
  cityId: string
  areaId: string
  residentialAddress?: ResidentialAddress | null
  dormitoryAddress?: DormitoryAddress | null
}
