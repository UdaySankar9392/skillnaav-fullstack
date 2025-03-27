import React, { useState, useEffect } from "react";
import axios from "axios";

const LevelThree = ({ profileData, setCreateLevelThree, handleProfileData }) => {
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [personalityResults, setPersonalityResults] = useState(null);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const answerOptions = [1, 2, 3, 4, 5];

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

        // Fetch active questions
        const questionsRes = await axios.get("/api/personality/questions");
        // Sorting questions by createdAt (you could sort by a custom order if needed)
        const sortedQuestions = questionsRes.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllQuestions(sortedQuestions);

        if (profileData?._id) {
          // Fetch existing responses for this user
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
            // Fetch calculated personality results from backend
            const personalityRes = await axios.get(
              `/api/personality/calculate?userId=${profileData._id}`
            );
            setPersonalityResults(personalityRes.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load questions. Please try again.");
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

  const getPointsFromResponse = (response) => {
    const map = {
      "Dislike": 1,
      "Slightly Dislike": 2,
      "Neutral": 3,
      "Slightly Enjoy": 4,
      "Enjoy": 5,
    };
    return map[response] || 3;
  };

  const getTraitFullName = (trait) => {
    const traitNames = {
      R: "Realistic",
      I: "Investigative",
      A: "Artistic",
      S: "Social",
      E: "Enterprising",
      C: "Conventional",
    };
    return traitNames[trait] || trait;
  };

  const getTraitDescription = (trait) => {
    const descriptions = {
      R: "Practical, physical, hands-on, tool-oriented. Enjoy working with objects, machines, tools, plants or animals.",
      I: "Analytical, intellectual, scientific, explorative. Enjoy observing, learning, investigating and problem-solving.",
      A: "Creative, original, independent, chaotic. Enjoy working with forms, designs and patterns, often in unstructured situations.",
      S: "Cooperative, supporting, helping, healing/nurturing. Enjoy working with people to enlighten, inform, help, train, or cure them.",
      E: "Competitive, leading, persuading. Enjoy working with people to influence, persuade, perform, lead or manage for organizational goals.",
      C: "Detail-oriented, organizing, clerical. Enjoy working with data, have clerical or numerical ability, carry out tasks in detail.",
    };
    return descriptions[trait] || "No description available.";
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      
      // Prepare responses using the selected answers
      const responses = allQuestions.map((question) => ({
        questionId: question._id,
        userId: profileData._id,
        response: selectedAnswers[question._id]?.response || "Neutral",
        points: getPointsFromResponse(selectedAnswers[question._id]?.response),
        riasecTrait: question.riasecTrait, // Use the trait directly from the question
      }));

      // Calculate trait scores locally for immediate feedback
      const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      responses.forEach(({ riasecTrait, points }) => {
        traitScores[riasecTrait] += points;
      });

      // Determine top traits and form the Holland Code
      const sortedTraits = Object.entries(traitScores)
        .sort((a, b) => b[1] - a[1])
        .map(([trait]) => trait);
      const hollandCode = sortedTraits.slice(0, 3).join("");

      // Save responses in bulk to the backend
      await axios.post("/api/personality/responses/bulk", { responses, userId: profileData._id });

      // Optionally, you can refetch the calculated results from backend here
      // const personalityRes = await axios.get(`/api/personality/calculate?userId=${profileData._id}`);
      // setPersonalityResults(personalityRes.data);

      // For instant feedback, set the local calculation as the result
      setPersonalityResults({
        hollandCode,
        scores: traitScores,
        dominantTraits: sortedTraits.slice(0, 3),
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Personality Assessment
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Personality Results Section */}
          {personalityResults && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <h3 className="text-2xl font-bold text-center mb-6">
                Your Holland Code: 
                <span className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
                  {personalityResults.hollandCode}
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {personalityResults.dominantTraits.map((trait, index) => (
                  <div
                    key={trait}
                    className={`p-4 border-l-4 ${
                      index === 0
                        ? "border-blue-500 bg-blue-50"
                        : index === 1
                        ? "border-purple-500 bg-purple-50"
                        : "border-green-500 bg-green-50"
                    }`}
                  >
                    <h4 className="font-bold text-lg">
                      {getTraitFullName(trait)} ({trait})
                    </h4>
                    <p>Score: {personalityResults.scores[trait]}</p>
                  </div>
                ))}
              </div>

              <h4 className="font-bold mb-2">Full Breakdown:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(personalityResults.scores).map(([trait, score]) => (
                  <div key={trait} className="px-3 py-2 bg-gray-100 rounded">
                    {trait}: {score}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Section */}
          {(!submitted || !personalityResults) && (
            <>
              {/* Answer Scale Explanation */}
              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-3 text-center">
                  How to Answer:
                </h3>
                <p className="mb-4">
                  For each activity, select how much you would enjoy doing it using the scale below:
                </p>
                <div className="flex justify-center space-x-6">
                  {answerOptions.map((option) => (
                    <div key={option} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md mx-auto">
                        {option}
                      </div>
                      <span className="text-xs mt-1 block">
                        {answerMapping[option]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicator */}
              <h3 className="text-xl font-semibold mb-4 text-center">
                Progress: {totalAnswered} / {allQuestions.length}
              </h3>

              {/* Questions and Answer Options */}
              <div className="space-y-4">
                {allQuestions.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
                    <h4 className="text-lg font-semibold mb-4">
                      {item.question}
                    </h4>
                    <div className="flex justify-center space-x-4">
                      {answerOptions.map((option) => {
                        const isSelected =
                          selectedAnswers[item._id]?.response === answerMapping[option];
                        return (
                          <div key={option} className="text-center">
                            <div
                              onClick={() => handleAnswerChange(item._id, option)}
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-md mx-auto cursor-pointer transition ${
                                isSelected 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              {option}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setCreateLevelThree(false)}
                  className="px-6 py-2 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={totalAnswered !== allQuestions.length || submitted || submitLoading}
                  className={`px-6 py-2 rounded-md font-semibold min-w-[180px] transition ${
                    totalAnswered !== allQuestions.length || submitted || submitLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {submitLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Submit Assessment"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LevelThree;
