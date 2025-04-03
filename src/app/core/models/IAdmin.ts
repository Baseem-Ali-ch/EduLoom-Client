export interface IOffer {
  _id?: string
  title: string;
  category: string;
  discount: number;
  isActive: boolean;
}

export interface ICoupon {
  _id?: string
  couponCode: string;
  discount: number;
  description: string;
  expDate: string;
  minPurAmt: number;
  maxPurAmt: number;
  isActive: boolean
}
