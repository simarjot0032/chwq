import Image from "next/image";

const Button = ({ iconAlt, text, isActive = false }) => {
  const buttonClass = isActive
    ? "py-2 px-4 bg-[#FFFFFF1A] rounded-[15px] gap-1 transition flex flex-row justify-between tab-button text-[14px] font-semibold flex items-center text-[#FFFFFFF]"
    : "py-2 px-4 bg-[#FFFFFF1A] rounded-[15px] gap-1 transition flex flex-row justify-between tab-button text-[14px] font-semibold text-[#FFFFFF80] flex items-center";

  return (
    <button className={buttonClass + " " + "transition-transform transform hover:scale-105"}>
      <Image src={`/${iconAlt}.svg`} alt={iconAlt} width={24} height={24} />
      <span>{text}</span>
    </button>
  );
};

export default Button;
