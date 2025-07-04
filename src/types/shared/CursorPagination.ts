export interface CursorPaginationParams {
  cursor: string | null
  size: number
}
export interface CursorPaginationResponse {
  nextCursor: string | null
  count: number
}
export class CursorPagination implements CursorPaginationParams, CursorPaginationResponse {
  constructor(size?: number) {
    this.size = size ?? 10;
  }

  nextCursor: null | string = ''
  cursor: null | string = ''
  count = 0
  size: number;

  // get getParams() {
  //   return {
  //     cursor: this.cursor,
  //     size: this.size,>
  //   }
  // }

  // setResponse(cursor: string, count: number) {
  //   this.nextCursor = cursor;
  //   this.count = count;
  // }
}
