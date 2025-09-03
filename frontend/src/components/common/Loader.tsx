// Loader.tsx
("use client");
import { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { LoaderTwo } from "../ui/loader";

const Loader = () => {
  const isLoading = useSelector((state: RootState) => state.loader.isLoading);
  if (!isLoading) return null;

  return <LoaderTwo />;
};

export default Loader;
