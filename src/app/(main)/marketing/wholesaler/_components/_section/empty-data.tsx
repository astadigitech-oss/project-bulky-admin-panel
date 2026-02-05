import React from "react";

export const EmptyData = ({ type }: { type: "email" | "anggaran" }) => {
  return (
    <div className="flex items-center justify-center w-full h-42">
      <p className="text-gray-500 dark:text-gray-400">
        {type === "email" ? "Email" : "Anggaran"} tidak ditemukan
      </p>
    </div>
  );
};
