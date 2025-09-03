"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setCurrency,
  currencies,
  Currency,
} from "@/redux/slices/currencySlice";
import Dropdown from "./Dropdown";

const CurrencySelector = () => {
  const dispatch = useDispatch();
  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    if (currency) {
      dispatch(setCurrency(currency));
    }
  };

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.symbol} ${currency.code} - ${currency.name}`,
    icon: <span className="font-medium">{currency.symbol}</span>,
  }));

  return (
    <div className="flex items-center gap-2">
      <Dropdown
        value={selectedCurrency.code}
        onValueChange={handleCurrencyChange}
        options={currencyOptions}
        placeholder="Select Currency"
        triggerClassName="w-72 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
      />
    </div>
  );
};

export default CurrencySelector;
