import LessonHeader from "./LessonHeader";
import CardComponet from "./CardComponent";
import Image from "next/image";
import { useEffect, useState } from "react";
import LeftArror from "@/lib/icon/LeftArror";
import RightArrow from "@/lib/icon/RightArrow";
import { coerceBoolean } from "openai/core";

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

  const handlePrevious = () => {
    const lesson = Lessons[selectedTab];
    const categories = lesson.categories;

    const currentCategoryIndex = categories.findIndex(
      (category) => category.catid === selectedCategory.catid
    );
    const currentQuestionIndex = selectedCategory.questions.findIndex(
      (q) => q.id === queSelected?.id
    );
    for (let i = currentQuestionIndex - 1; i >= 0; i--) {
      if (!selectedCategory.questions[i].status) {
        setQueSelected(selectedCategory.questions[i]);
        return;
      }
    }
    for (let j = currentCategoryIndex - 1; j >= 0; j--) {
      const prevCategory = categories[j];
      const prevUnanswered = prevCategory.questions
        .slice()
        .reverse()
        .find((q) => !q.status);
      if (prevUnanswered) {
        setSelectedCategory(prevCategory);
        setQueSelected(prevUnanswered);
        return;
      }
    }
  };

  const handleNext = () => {
    const lesson = Lessons[selectedTab];
    const categories = lesson.categories;
    const currentCategoryIndex = categories.findIndex(
      (category) => category.catid === selectedCategory.catid
    );
    const currentQuestionIndex = selectedCategory.questions.findIndex(
      (q) => q.id === queSelected?.id
    );
    for (
      let i = currentQuestionIndex + 1;
      i < selectedCategory.questions.length;
      i++
    ) {
      if (!selectedCategory.questions[i].status) {
        setQueSelected(selectedCategory.questions[i]);
        return;
      }
    }
    for (let j = currentCategoryIndex + 1; j < categories.length; j++) {
      const nextCategory = categories[j];
      const nextUnanswered = nextCategory.questions.find((q) => !q.status);

      if (nextUnanswered) {
        setSelectedCategory(nextCategory);
        setQueSelected(nextUnanswered);
        return;
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        <LessonHeader title={lessonName} />
        <span
          className="text-[18px] font-[390] text-[#666666] flex"
          style={{ gap: "10px" }}
        >
          <button
            disabled={
              queSelected?.status ||
              (() => {
                const lesson = Lessons[selectedTab];
                const categories = lesson.categories;
                const currentCategoryIndex = categories.findIndex(
                  (category) => category.catid === selectedCategory.catid
                );
                const currentQuestionIndex =
                  selectedCategory.questions.findIndex(
                    (q) => q.id === queSelected?.id
                  );
                const previousQuestionsInCurrentCategory =
                  selectedCategory.questions.slice(0, currentQuestionIndex);
                const previousQuestions =
                  previousQuestionsInCurrentCategory.filter(
                    (q) => queSelected?.id != q.id || queSelected.id < q.id
                  );
                const hasUnansweredBefore = previousQuestions.some(
                  (q) => !q.status
                );
                console.log(previousQuestions);
                const previousCategories = categories.slice(
                  0,
                  currentCategoryIndex
                );

                const hasUnansweredInPreviousCategories = previousCategories
                  .flatMap((cat) => cat.questions)
                  .some((q) => !q.status);

                return !(
                  hasUnansweredInPreviousCategories || hasUnansweredBefore
                );
              })()
            }
            className="disabled:cursor-not-allowed"
            onClick={handlePrevious}
          >
            <LeftArror />
          </button>
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
          <button
            disabled={(() => {
              const lesson = Lessons[selectedTab];
              const categories = lesson.categories;
              const currentCategoryIndex = categories.findIndex(
                (category) => category.catid === selectedCategory.catid
              );
              const currentQuestionIndex = selectedCategory.questions.findIndex(
                (q) => q.id === queSelected?.id
              );
              const remainingQuestionsInCurrentCategory =
                selectedCategory.questions.slice(currentQuestionIndex + 1);
              const hasUnansweredAfter =
                remainingQuestionsInCurrentCategory.some((q) => !q.status);

              const followingCategories = categories.slice(
                currentCategoryIndex + 1
              );
              const hasUnansweredInFollowingCategories = followingCategories
                .flatMap((cat) => cat.questions)
                .some((q) => !q.status);
              return !(
                hasUnansweredAfter || hasUnansweredInFollowingCategories
              );
            })()}
            className="disabled:cursor-not-allowed"
            onClick={handleNext}
          >
            <RightArrow />
          </button>
        </span>
      </div>
      <div className="flex flex-col  md:mt-0 text-white rounded-lg w-[100%]">
        {queSelected ? (
          <CardComponet
            key={queSelected?.id}
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
