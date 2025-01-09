import LoadingIcon from "@/lib/icon/LoadingIcon";
import React from "react";

const LoadingStatus = ({ h, w }) => {
  console.log(h, w);
  return (
    <div
      className={`flex flex-col bg-[#0000004D] rounded-[15] justify-center relative mt-[25px] `}
      style={{ width: `${w}%`, height: `${h}px` }}
    >
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LoadingIcon />
        <span className="font-[390] text-[14px] ">Loading!</span>
      </div>
      {/* <div className="w-full flex justify-end">
        <Image
          src={ProfileIcon}
          alt="Profile Icon"
          className="absolute bottom-4 right-0
"
        />
      </div> */}
    </div>
  );
};

export default LoadingStatus;
