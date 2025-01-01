import LoadingIcon from "@/lib/icon/LoadingIcon";
import ProfileIcon from "@/lib/icon/ProfileIcon.png";
import React from "react";
import Image from "next/image";

const LoadingStatus = ({ status }) => {
  return (
    <div className="flex flex-col bg-[#0000004D] h-[200px] w-[200px] rounded-[15] justify-center relative">
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LoadingIcon />
        <span className="font-[390] text-[14px] ">Checking your code!</span>
      </div>
      <div className="w-full flex justify-end">
        <Image src={ProfileIcon} alt="Profile Icon" className="absolute bottom-4 right-0
" />
      </div>
    </div>
  );
};

export default LoadingStatus;
