import LessonHeader from "./LessonHeader";
import CardComponet from "./CardComponent";
import Image from "next/image";
import { useEffect, useState } from "react";

const Test = ({
  profileImage,
  selectedTab,
  Lessons,
  updateLessons,
  selectedCategory,
  setSelectedCategory,
  lessonName,
  setSelectedTab,
}) => {
  const [queSelected, setQueSelected] = useState(null);

  useEffect(() => {
    // Get the latest category data from Lessons
    const currentCategory = Lessons[selectedTab].categories.find(
      (cat) => cat.catid === selectedCategory.catid
    );

    if (currentCategory && !queSelected) {
      // Only set if no question is selected
      // Find the first question with status: false in the updated category data
      const unansweredQuestion = currentCategory.questions.find(
        (question) => !question.status
      );

      if (unansweredQuestion) {
        console.log("Found first unanswered question:", unansweredQuestion);
        setQueSelected(unansweredQuestion);
      } else {
        console.log("No unanswered questions found");
        setQueSelected(false);
      }
    }
  }, [selectedCategory]); // Only depend on selectedCategory changes

  // Add function to update selected question
  const updateSelectedQuestion = (newQuestion) => {
    setQueSelected(newQuestion);
  };
  useEffect(() => {
    if (
      selectedCategory.questions.every((question) => question.status == true)
    ) {
      const nextCategory = Lessons[selectedTab].categories.find(
        (cat) => cat.catid === selectedCategory.catid + 1
      );

      if (nextCategory) {
        setSelectedCategory(nextCategory);
      }
    }
  }, [queSelected, selectedCategory, setSelectedCategory]);

  return (
    <div className="w-full">
      <div className="flex items-center">
        <LessonHeader title={lessonName} />
        <span className="text-[18px] font-[390] text-[#666666]">
          {selectedCategory.catid == 1
            ? queSelected?.id
            : queSelected.id +
              Lessons[selectedTab].categories
                .slice(0, selectedCategory.catid - 1)
                .reduce((sum, category) => sum + category.questions.length, 0)}
          /
          {Lessons[selectedTab].categories?.reduce(
            (total, noofquestions) => total + noofquestions.questions.length,
            0
          )}
        </span>
      </div>
      <div className="flex flex-col  md:mt-0 text-white rounded-lg w-[100%]">
        {queSelected ? (
          <CardComponet
            imageSrc={profileImage}
            imageAlt="Profile Image"
            categoryId={selectedCategory.catid}
            description={queSelected.question}
            queId={queSelected.id}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            updateLessons={updateLessons}
            Lessons={Lessons}
            setSelectedCategory={setSelectedCategory}
            updateSelectedQuestion={updateSelectedQuestion} // Pass the function
          >
            {queSelected?.imageSrc ? (
              <Image
                src={queSelected.imageSrc}
                alt="Question related image"
                width={350}
                height={100}
                layout="fit"
                className="rounded-[15px]"
              />
            ) : null}
          </CardComponet>
        ) : (
          <span>No unanswered questions left for this lesson!</span>
        )}
      </div>
    </div>
  );
};

export default Test;
