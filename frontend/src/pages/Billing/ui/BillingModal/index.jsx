// components/BillingModal.js
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../../../../components/Button";
import SimpleInputField from "../../../../components/SimpleInputFields";

const BillingModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [instituteName, setInstituteName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInstituteName(initialData.instituteName || "");
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setStreetAddress(initialData.streetAddress || "");
      setApartment(initialData.apartment || "");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setPostalCode(initialData.postalCode || "");
      setCountryCode(initialData.countryCode || "+1");
      setPhoneNumber(initialData.phoneNumber || "");
      setTaxNumber(initialData.taxNumber || "");
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    const updatedInfo = {
      instituteName,
      firstName,
      lastName,
      streetAddress,
      apartment,
      city,
      state,
      postalCode,
      countryCode,
      phoneNumber,
      taxNumber,
    };
    onSave(updatedInfo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="billing-modal"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target.id === "billing-modal" && onClose()}
    >
      <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <h2 className="text-lg md:text-2xl font-semibold text-primary mb-6">
          Edit Information
        </h2>

        <div className="flex flex-col md:space-y-2 border border-x-0 border-customGray py-5">
          <SimpleInputField
            placeholder="Institute Name"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <SimpleInputField
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <SimpleInputField
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <SimpleInputField
              placeholder="Street Address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
            <SimpleInputField
              placeholder="Apartment/Unit"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <SimpleInputField
              placeholder="Town/City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <SimpleInputField
              placeholder="State/Province"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>

          <SimpleInputField
            placeholder="Postal/Zip Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          <SimpleInputField
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <SimpleInputField
            placeholder="Tax/VAT Number"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button
            onClick={onClose}
            className="px-4 py-2 font-medium bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-4 py-2 font-medium bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillingModal;
