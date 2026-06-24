import React from "react";
import { MapPin } from "lucide-react";

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
}

interface AddressListProps {
  addresses: Address[] | undefined;
}

const AddressList: React.FC<AddressListProps> = ({ addresses }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-gray-400 flex items-center gap-2 mt-3">
        <MapPin size={18} />
        <span>No address provided</span>
      </div>
    );
  }

  // Separate default and others
  const defaultAddress = addresses.find((a) => a.isDefault);
//   const otherAddresses = addresses.filter((a) => a.isDefault);

  return (
    <div className="mt-3 space-y-3">
      {/* Default Address */}
      {defaultAddress && (
        <div className=" relative">
         
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-5 h-5 mt-0.5 text-blue-500" />
            <div>
         
              <p>
                {defaultAddress?.label === "HEAD_OFFICE"
                ? "HQ"
                : defaultAddress?.label === "BRANCH"
                ? "BH"
                : "WH"}{" - "}
                {defaultAddress.street}, {defaultAddress.city},{" "}
                {defaultAddress.state}, {defaultAddress.country}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Addresses */}
      {/* {otherAddresses.map((address) => (
        <div
          key={address.id}
          className="border border-gray-200 rounded-md p-4 flex items-start gap-2 text-gray-500"
        >
          <MapPin className="w-5 h-5 mt-0.5 text-gray-400" />
          <div>
            <p>
              {address.street}, {address.city}, {address.state},{" "}
              {address.country}
            </p>
          </div>
        </div>
      ))} */}
    </div>
    
  );
};

export default AddressList;
