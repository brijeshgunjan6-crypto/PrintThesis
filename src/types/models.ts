export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string; // Hashed password
  addresses: Address[];
  profileImage?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  orderId: string;
  userId: string;
  files: UploadedFile[];
  printOptions: PrintOptions;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  orderStatus: 'Order Received' | 'File Verified' | 'Printing Started' | 'Printing Completed' | 'Binding Started' | 'Packed' | 'Shipped' | 'Delivered';
  invoiceUrl?: string;
  addressId: string;
  createdAt: string;
}

export interface UploadedFile {
  name: string;
  size: string;
  url?: string; // Cloud storage URL
}

export interface PrintOptions {
  pages: number;
  colorPages: number;
  colorMode: 'bw' | 'color' | 'mixed';
  paperType: string;
  binding: string;
  coverColor: string;
  copies: number;
}
