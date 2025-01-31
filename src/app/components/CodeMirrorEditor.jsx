import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { openAIService } from "@/Service/openai-service";
import LoadingStatus from "./Test/LoadingStatus";
import ConfirmedStatus from "./Test/ConfirmedStatus";
import ProgressBar from "./ProgressBar";
import Image from "next/image";

const CodeMirror = dynamic(() => import("react-codemirror"), { ssr: false });

const CodeMirrorEditor = ({
  question,
  updateLessons,
  selectedTab,
  categoryId,
  questionId,
  Lessons,
  setSelectedCategory,
  setSelectedTab,
  updateSelectedQuestion,
}) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState(`// Write your code here\n\n\n\n\n\n\n\n\n`);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    import("codemirror/lib/codemirror.css");
    import("codemirror/theme/dracula.css");
    import("codemirror/mode/javascript/javascript.js");
  }, []);

  const updateSelectedTab = (selectedTab, categoryId, questionId, answer) => {
    const updatedLessons = {
      ...Lessons,
      [selectedTab]: {
        ...Lessons[selectedTab],
        categories: Lessons[selectedTab].categories.map((category) => {
          if (category.catid === categoryId) {
            return {
              ...category,
              questions: category.questions.map((question) => {
                if (question.id === questionId) {
                  return { ...question, status: answer }; // Mark question as answered or unanswered
                }
                return question;
              }),
            };
          }
          return category;
        }),
      },
    };

    updateLessons(updatedLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true); // Start loading
    try {
      const response = await openAIService.sendPrompt(code, question);
      if (response) {
        const isCorrect = response.toLowerCase() === "true"; // Convert string to boolean
        setIsAnswerCorrect(isCorrect);
        setShowConfirmed(true);
        updateSelectedTab(selectedTab, categoryId, questionId, isCorrect);
      }
    } catch (error) {
      alert(error);
    } finally {
      setShowResult(true);
      setIsLoading(false);
    }
  };

  const resetQuestion = () => {
    setShowResult(false);
    setShowConfirmed(false);
    setIsAnswerCorrect(null);
    setCode(`// Write your code here\n\n\n\n\n\n\n\n\n ${updatedCode} `);
  };

  const handleNextQuestion = () => {
    // Find current category

    const currentCategory = Lessons[selectedTab].categories.find(
      (cat) => cat.catid === categoryId
    );

    if (currentCategory) {
      // Find current question index in the category's questions array
      const currentQuestionIndex = currentCategory.questions.findIndex(
        (q) => q.id === questionId
      );

      // Look for the next unanswered question after the current one
      const nextUnansweredQuestion = currentCategory.questions
        .slice(currentQuestionIndex + 1)
        .find((q) => !q.status);

      if (nextUnansweredQuestion) {
        // There is another unanswered question in this category

        setShowResult(false);
        setCode(`// Write your code here\n\n\n\n\n\n\n\n\n`);
        setShowConfirmed(false);
        setIsAnswerCorrect(null);
        updateSelectedQuestion(nextUnansweredQuestion); // Update the selected question
      } else {
        // Check if all questions in the category are answered
        // const allQuestionsAnswered = currentCategory.questions.every(
        // (q) => q.status
        // );allQuestionsAnswered && // testing purpose

        if (typeof setSelectedCategory === "function") {
          let nextCategory = Lessons[selectedTab].categories.find(
            (cat) => cat.catid === categoryId + 1
          );

          if (nextCategory) {
            setSelectedCategory(nextCategory);
            updateSelectedQuestion(nextCategory?.questions[0]);
            setShowResult(false);
            setShowConfirmed(false);
            setIsAnswerCorrect(null);
            setCode(`// Write your code here\n\n\n\n\n\n\n\n\n`);
          }
        }
      }
    }
  };
  const handleNextLesson = () => {
    if (Object.keys(Lessons).length != selectedTab) {
      setSelectedTab(selectedTab + (selectedTab === 7 ? 3 : 1));
      if (selectedTab != 7) {
        let nextCategory = Lessons[selectedTab + 1]?.categories.find(
          (cat) => cat.catid == categoryId + 1
        );

        setSelectedCategory(Lessons[selectedTab + 1]?.categories[0]);
        updateSelectedQuestion(nextCategory?.questions[0]);
        setShowResult(false);
        setShowConfirmed(false);
        setIsAnswerCorrect(null);
        setCode(`// Write your code here\n\n\n\n\n\n\n\n\n`);
      } else {
        let nextCategory = Lessons[selectedTab + 3]?.categories.find(
          (cat) => cat.catid == categoryId + 1
        );

        setSelectedCategory(Lessons[selectedTab + 3]?.categories[0]);
        updateSelectedQuestion(nextCategory?.questions[0]);
        setShowResult(false);
        setShowConfirmed(false);
        setIsAnswerCorrect(null);
        setCode(`// Write your code here\n\n\n\n\n\n\n\n\n`);
      }
    } else {
      setShowCongrats(true);
    }
  };
  const handleWrongAssement = async () => {
    setSaveLoading(true);
    setSaving(true);
    let update = code
      .split("")
      .map((letter) =>
        letter == "\n" ? " <br> " : letter == "\t" ? "    " : letter
      )
      .join("");
    const response = await fetch("../api/SaveToFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: `${question} <br> <br>`,
        code: `${update} <br> Assement made is wrong`,
      }),
    });

    if (response.ok) {
      setSaveLoading(false);

      setTimeout(() => {
        setSaving(false);
        handleNextQuestion();
      }, 3000);
    }
  };
  useEffect(() => {
    let category = Lessons[selectedTab].categories;
    if (
      category.every((category) =>
        category.questions.every((question) => question.status == true)
      )
    ) {
      setShowCongrats(true);
      const IdOfTime = setTimeout(() => {
        setShowCongrats((prev) => (prev ? false : true));
        selectedTab == Object.keys(Lessons)[Object.keys(Lessons).length - 1]
          ? undefined
          : handleNextLesson();
      }, 3000);

      return () => clearTimeout(IdOfTime);
    }
  }, [Lessons, selectedTab, categoryId]);

  return (
    <>
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#2D2D2D] p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-[450] text-green-500 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-white text-lg">
              You've completed all questions in this Lesson
            </p>
          </div>
        </div>
      )}
      {saving && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#2D2D2D] p-8 rounded-lg shadow-xl text-center">
            {saveLoading && saving && (
              <>
                <div className="mb-[25px]">
                  <LoadingStatus h={150} w={100} />
                </div>
                <p className="text-white text-lg">Submitting your issue!</p>
              </>
            )}

            {saving && !saveLoading && (
              <p className="text-white text-lg">
                Your issue has been recored. Moving to next Question!!
              </p>
            )}
          </div>
        </div>
      )}
      {!isLoading ? (
        <div className="relative mb-[25px]">
          <CodeMirror
            key={questionId}
            ref={editorRef}
            value={code}
            options={{
              mode: "javascript",
              theme: "dracula",
              lineNumbers: true,
              readOnly: isLoading || showResult ? "nocursor" : false,
            }}
            onChange={(value) => {
              const updatedCode = String(value || ""); // Ensure value is always a string
              setCode(updatedCode);
            }}
          />
          <style jsx global>{`
            /* Styling for the CodeMirror container */
            .CodeMirror {
              border-radius: 15px !important; /* Rounded corners for the entire editor */
              font-family: "BrandonGrotesque" !important;
              width: 80% !important;
              font-weight: 390;
              font-size: 14px;
              line-height: 24px;
            }
            /* Styling for line numbers */
            .CodeMirror-linenumber {
              border-radius: 15px !important; /* Rounded line numbers */
              color: #ffffff4d !important; /* Color of line numbers */
              text-align: center !important;
            }
            .ReactCodeMirror {
              display: flex;
              justify-content: end;
            }
            .CodeMirror-gutter {
              background-color: #333236;
              text-align: center !important;
            }
            .CodeMirror-vscrollbar {
              overflow-y: hidden !important;
            }
          `}</style>
          {isLoading || showResult ? (
            ""
          ) : (
            <button
              className="absolute bottom-3 right-4 z-[9999999] flex items-center justify-center px-4 py-2 bg-[#FFCF4B] text-[#333333] text-[#333333] text-[14px] font-semibold rounded-lg transition-transform transform hover:scale-105 "
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Submit
            </button>
          )}
          {/* {isLoading ? (
        <div className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
      ) : (
        "Submit"
      )} */}
          <style jsx>{`
            .loader {
              display: inline-block;
            }
          `}</style>
        </div>
      ) : (
        <div className="w-full flex justify-end">
          <LoadingStatus h={300} w={80} />
        </div>
      )}
      {/* {isLoading ? (
        <div className="w-full flex justify-end">
          <LoadingStatus />
        </div>
      ) : showConfirmed ? (
        <div className="w-full flex justify-end">
          <ConfirmedStatus />
        </div>
      ) : (
        ""
      )} */}

      {isLoading || showResult ? (
        ""
      ) : (
        <div
          className={`absolute right-[5px]  ${
            showResult ? "bottom-[33px]" : "bottom-[42px]"
          }`}
          style={{ padding: "5px" }}
        >
          <Image
            src={"/profile-user.png"}
            alt="user-icon"
            width={25}
            height={25}
          />
        </div>
      )}
      {showResult &&
        (isAnswerCorrect ? (
          <>
            <Image
              width={200}
              height={200}
              layout="fit"
              src={"/answerRight.png"}
              alt="conguralation image"
            />
            <div className="mt-2 px-4 py-2 bg-[#333236] rounded-[15px] text-[16px] font-[390] w-full sm:w-8/12">
              Congratulations 🎉, your code worked successfully!{" "}
            </div>
          </>
        ) : (
          <div className="mt-2 px-4 py-2 bg-[#333236] rounded-[15px] text-[16px] font-[390] w-full sm:w-8/12">
            Oops! 😅 There's a mistake in the code. Try again—you've got this!
            💪 . Otherwise if you think that asessment is incorrect, reach out
            to your instructor.
            <div className="flex gap-[15px] mt-[2px]">
              <button
                className="z-[9999999] flex items-center justify-center px-4 py-2 bg-[#FFCF4B] text-[#333333] text-[14px] font-[450]  rounded-lg mt-1 transition-transform transform hover:scale-105 "
                type="button"
                onClick={resetQuestion}
              >
                Retry
              </button>
              {/* <button
                className="z-[9999999] flex items-center justify-center px-4 py-2 hover:bg-[#FFCF4B] text-[#FFFFF] border-[1px] border-[#FFCF4B] text-[14px] font-[450]  rounded-lg mt-1 transition-transform transform hover:scale-105 hover:text-[#333333] "
                type="button"
                onClick={handleWrongAssement}
              >
                Something is wrong
              </button> */}
            </div>
          </div>
        ))}
      {showResult && isAnswerCorrect ? (
        <>
          <div className="w-[100%] border-b-[1px] border-opacity-10 border-white mb-[1.5rem] mt-[5rem]"></div>
          <div className="w-full flex justify-between items-center gap-3">
            <div className="flex flex-col flex-1 px-2">
              {/* <span className="text-[13px] italic font-normal text-white mb-2">
                Completed 1 out of 11 exercises. 10 more to go!
              </span> */}
              <ProgressBar
                totalQuestions={Lessons[selectedTab].categories.reduce(
                  (total, noofquestion) =>
                    total + noofquestion.questions.length,
                  0
                )}
                answeredQuestions={Lessons[selectedTab].categories.reduce(
                  (total, noofquestion) =>
                    total +
                    noofquestion.questions.reduce(
                      (total, no) => total + (no.status == true ? 1 : 0),
                      0
                    ),
                  0
                )}
              />
            </div>

            <button
              className="z-[9999999] flex items-center justify-center px-4 py-2 bg-[#FFCF4B] text-[#333333] text-[14px] font-[450] rounded-lg mt-1 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
              type="button "
              onClick={handleNextQuestion}
              // disabled={Lessons[selectedTab].categories.reduce((total, noofquestion) => total + noofquestion.questions.length, 0) == Lessons[selectedTab].categories.reduce((total, noofquestion) => total + noofquestion.questions.reduce((total, no) => total + (no.status == true ? 1 : 0), 0), 0) ? true : false}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </>
  );
};

export default CodeMirrorEditor;
