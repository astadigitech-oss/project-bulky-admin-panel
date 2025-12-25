import { MainContainer } from "@/components/main-container";
import React from "react";

const DiscountPage = () => {
  return (
    <MainContainer
      breadcrumbs={[
        {
          label: "Pemasaran",
        },
        {
          label: "Diskon",
        },
      ]}
    >
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default DiscountPage;
