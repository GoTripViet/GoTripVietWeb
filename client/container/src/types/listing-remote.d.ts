declare module "mfeListing/ListingHotel" {
  import * as React from "react";

  export interface ListingHotelProps {
    destinationName?: string;
    totalStays?: number;
    // nếu sau này bạn truyền thêm props thì bổ sung ở đây
  }

  const ListingHotel: React.ComponentType<ListingHotelProps>;
  export default ListingHotel;
}