import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const LevelThree = ({ profileData, setCreateLevelThree }) => {
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

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
    if (submitted) return;

    const answersToSubmit = Object.keys(selectedAnswers).map((questionId) => ({
      userId: profileData?._id,
      questionId: questionId,
      response: selectedAnswers[questionId]?.response,
      points: 0,
      status: "active",
    }));

    axios
      .post("/api/personality/responses/bulk", {
        responses: answersToSubmit,
        userId: profileData?._id,
      })
      .then(({ data }) => {
        if (data.success) {
          setCreateLevelThree(false);
          setSubmitted(true);
        } else {
          console.error("Error saving answers:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error saving answers:", error.response || error.message);
      });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Personality Questionnaire</h2>
        <button onClick={() => setCreateLevelThree(false)} className="text-red-500 text-xl">&#10006;</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <CircularProgress />
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">Progress: {totalAnswered} / {allQuestions.length}</p>
          <div className="space-y-4">
            {allQuestions.map((item) => (
              <div key={item._id} className="border p-4 rounded-md bg-gray-50">
                <p className="mb-2 font-medium text-gray-800">{item.question}</p>
                <div className="flex space-x-4 justify-start">
                  {answrOptions.map((option) => {
                    const isSelected = selectedAnswers[item._id]?.response === answerMapping[option];
                    return (
                      <button
                        key={option}
                        className={`w-10 h-10 rounded-full text-center font-bold border transition duration-300 ${
                          isSelected ? "bg-blue-500 text-white" : "bg-white border-gray-300"
                        }`}
                        onClick={() => handleAnswerChange(item._id, option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={totalAnswered !== allQuestions.length || submitted}
          >
            Submit Answers
          </button>
        </>
      )}
    </div>
  );
};

export default LevelThree;
