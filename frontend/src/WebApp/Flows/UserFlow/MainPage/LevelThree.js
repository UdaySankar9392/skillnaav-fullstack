import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material"; // Material UI Spinner

const LevelThree = ({ profileData, setCreateLevelThree, handleProfileData }) => {
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false); // Track submission status

  const answrOptions = [1, 2, 3, 4, 5];

  const answerMapping = {
    1: "Dislike",
    2: "Slightly Dislike",
    3: "Neutral",
    4: "Slightly Enjoy",
    5: "Enjoy",
  };

  useEffect(() => {
    const fetchQuestionsAndResponses = async () => {
      try {
        setLoading(true);

        const questionsRes = await axios.get("/api/personality/questions");
        const sortedQuestions = questionsRes.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllQuestions(sortedQuestions);

        if (profileData?._id) {
          const responsesRes = await axios.get(
            `/api/personality/responses?userId=${profileData._id}`
          );
          const responseMap = {};

          responsesRes.data.forEach((item) => {
            responseMap[item.questionId._id] = {
              response: item.response,
              question: item.questionId.question,
            };
          });

          setSelectedAnswers(responseMap);

          if (responsesRes.data.length > 0) {
            setSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndResponses();
  }, [profileData]);

  const totalAnswered = Object.keys(selectedAnswers).filter(
    (key) => selectedAnswers[key]?.response
  ).length;

  const handleAnswerChange = (questionId, answerIndex) => {
    const responseValue = answerMapping[answerIndex];

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        response: responseValue,
      },
    }));
  };

  const handleSubmit = () => {
    if (submitted) {
      return; // Don't submit if already submitted
    }

    const answersToSubmit = Object.keys(selectedAnswers).map((questionId) => {
      const responseValue = selectedAnswers[questionId]?.response;
      return {
        userId: profileData?._id,
        questionId: questionId,
        response: responseValue,
        points: 0,
        status: "active",
      };
    });

    console.log("Submitting answers:", answersToSubmit);

    axios
      .post("/api/personality/responses/bulk", {
        responses: answersToSubmit,
        userId: profileData?._id,
      })
      .then(({ data }) => {
        if (data.success) {
          setCreateLevelThree(false);
          setSubmitted(true); // Set submitted to true after successful submission
        } else {
          console.error("Error saving answers:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error saving answers:", error.response || error.message);
      });
  };

  return (
    <div className="popularS1">
      <div className="head-txt">
        <div className="title">Naavi Profile Level Three</div>
        <div
          onClick={() => setCreateLevelThree(false)}
          className="close-div cursor-pointer"
        >
          <span>&#10006;</span>
        </div>
      </div>

      <div className="overall-div">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="progress-text">
              Test Progress: {totalAnswered} / {allQuestions.length}
            </div>
            <div className="level3-section">
              {allQuestions.map((item) => (
                <div key={item._id} className="single-question-wrapper py-4">
                  <div className="question-text">{item.question}</div>
                  <div className="answer-options flex gap-6 mt-2">
                    {answrOptions.map((option) => {
                      const isSelected =
                        selectedAnswers[item._id]?.response ===
                        answerMapping[option];

                      return (
                        <div
                          key={option}
                          className={`answer-circle p-4 cursor-pointer rounded-full text-center transition-colors duration-300 ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }`}
                          onClick={() => handleAnswerChange(item._id, option)}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSubmit}
                className="submit-btn bg-blue-500 text-white px-6 py-3 rounded-full mt-4 disabled:bg-gray-400"
                disabled={totalAnswered !== allQuestions.length || submitted}
              >
                Submit All Answers
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelThree;
