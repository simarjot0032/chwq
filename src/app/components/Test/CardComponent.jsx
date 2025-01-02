import Image from "next/image";
import Button from "./Button";
import CodeMirrorEditor from "../CodeMirrorEditor";

const Card = ({ imageSrc, imageAlt, description, updateLessons, selectedTab, categoryId, queId, Lessons, setSelectedCategory, updateSelectedQuestion, children, setSelectedTab }) => {
  return (
    <div className="pt-2.5 pr-12 pl-4 bg-[#1E1E1E] rounded-[15px] relative">
      <div className="flex flex-row">
        <div className="sm:flex-none">
          <Image src={imageSrc} alt={imageAlt} width={80} height={80} /> {/* Use number for width and height */}
        </div>
        <div className="flex flex-col gap-y-2.5 ">
          <span className="text-[14px] font-semibold text-[#ffffff]">{Lessons[selectedTab].categories[categoryId - 1].questions[queId - 1].title}</span>
          <div className="flex flex-col gap-4 px-5 py-4 bg-[#FFFFFF1A] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] relative ">
            <span className="text-[14px] font-[390] leading-6 text-[#ffffff]" >
              {
                description?.split(' ').map((line, index) =>
                  line == "<br>" ? (<br></br>) : line?.startsWith("'") && line?.endsWith("'") ? (<span style={{ color: "#bb0000", fontFamily: "monospace" }}>{" " + line.split('').filter((line) => line != "'").join("")}</span>) : <span>{" " + line}</span>
                )
              }
            </span>
            {children}

            <Image src={imageSrc} alt={imageAlt} width={25} height={25} className="absolute right-1 bottom-1" /> {/* Use number for width and height */}

          </div>
          <div className="flex gap-2">
            <Button iconAlt="docsIcon" text="Docs" isActive={true} />
            <Button iconAlt="hintsIcon" text="Hints" isActive={false} />
            <Button iconAlt="helpIcon" text="Help" isActive={false} />
          </div>
        </div>
      </div>
      <div className="mt-[2rem] mb-[2rem]">
        <CodeMirrorEditor question={description} updateLessons={updateLessons} selectedTab={selectedTab} categoryId={categoryId} questionId={queId} Lessons={Lessons} setSelectedCategory={setSelectedCategory} updateSelectedQuestion={updateSelectedQuestion} imageSrc={imageSrc} setSelectedTab={setSelectedTab} />
      </div>
    </div >
  );
};

export default Card;
