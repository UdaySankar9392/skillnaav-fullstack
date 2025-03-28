import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const LevelThree = ({ profileData, setCreateLevelThree, handleProfileData }) => {
  // State initialization
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [personalityResults, setPersonalityResults] = useState(null);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Constants
  const answerOptions = [1, 2, 3, 4, 5];
  const answerMapping = {
    1: "Dislike",
    2: "Slightly Dislike",
    3: "Neutral",
    4: "Slightly Enjoy",
    5: "Enjoy",
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questions
        const questionsResponse = await axios.get("/api/personality/questions");
        const validQuestions = Array.isArray(questionsResponse?.data) 
          ? questionsResponse.data 
          : [];
        
        setAllQuestions(validQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        // Fetch responses if user exists
        if (profileData?._id) {
          try {
            const responsesResponse = await axios.get(
              `/api/personality/responses?userId=${profileData._id}`
            );
            
            const validResponses = Array.isArray(responsesResponse?.data) 
              ? responsesResponse.data 
              : [];
            
            const answersMap = {};
            validResponses.forEach(item => {
              if (item?.questionId?._id) {
                answersMap[item.questionId._id] = {
                  response: item.response,
                  question: item.questionId.question,
                };
              }
            });
            
            setSelectedAnswers(answersMap);
            setSubmitted(validResponses.length > 0);

            // Fetch personality results if responses exist
            if (validResponses.length > 0) {
              try {
                const personalityRes = await axios.get(
                  `/api/personality/calculate?userId=${profileData._id}`
                );
                
                // Transform backend response to ensure consistent format
                const backendData = personalityRes?.data || {};
                const transformedResults = {
                  hollandCode: backendData.personality || backendData.hollandCode || '',
                  dominantTraits: backendData.personality?.split('') || backendData.dominantTraits || [],
                  scores: backendData.scores || {}
                };
                
                setPersonalityResults(transformedResults);
              } catch (calcError) {
                console.error("Calculation error:", calcError);
              }
            }
          } catch (responseError) {
            console.error("Response fetch error:", responseError);
          }
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        setError("Failed to load data. Please try again.");
        setAllQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileData]);

  // Helper functions
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
      R: "Practical, hands-on, tool-oriented",
      I: "Analytical, intellectual, scientific",
      A: "Creative, original, independent",
      S: "Cooperative, supporting, helping",
      E: "Competitive, leading, persuading",
      C: "Detail-oriented, organizing",
    };
    return descriptions[trait] || "No description available.";
  };

  // Event handlers
  const handleAnswerChange = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        response: answerMapping[answerIndex],
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      // Prepare responses
      const responses = allQuestions.map(question => ({
        questionId: question._id,
        userId: profileData._id,
        response: selectedAnswers[question._id]?.response || "Neutral",
        points: getPointsFromResponse(selectedAnswers[question._id]?.response),
        riasecTrait: question.riasecTrait,
      }));

      // Calculate scores
      const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      responses.forEach(({ riasecTrait, points }) => {
        if (riasecTrait && traitScores.hasOwnProperty(riasecTrait)) {
          traitScores[riasecTrait] += points;
        }
      });

      // Determine Holland Code
      const sortedTraits = Object.entries(traitScores)
        .sort((a, b) => b[1] - a[1])
        .map(([trait]) => trait);
      const hollandCode = sortedTraits.slice(0, 3).join("");

      // Save to backend
      await axios.post("/api/personality/responses/bulk", { 
        responses, 
        userId: profileData._id 
      });

      // Set results
      setPersonalityResults({
        hollandCode,
        scores: traitScores,
        dominantTraits: sortedTraits.slice(0, 3),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Derived values
  const totalAnswered = Object.values(selectedAnswers).filter(
    answer => answer?.response
  ).length;

  // Render
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Personality Assessment
      </h1>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center">
          {error}
        </div>
      )}

      {personalityResults ? (
        <ResultsView 
          results={personalityResults} 
          getTraitFullName={getTraitFullName}
          getTraitDescription={getTraitDescription}
        />
      ) : (
        <TestView
          allQuestions={allQuestions}
          selectedAnswers={selectedAnswers}
          answerOptions={answerOptions}
          answerMapping={answerMapping}
          totalAnswered={totalAnswered}
          handleAnswerChange={handleAnswerChange}
          handleSubmit={handleSubmit}
          submitLoading={submitLoading}
          setCreateLevelThree={setCreateLevelThree}
        />
      )}
    </div>
  );
};

// Sub-components
const ResultsView = ({ results, getTraitFullName, getTraitDescription }) => {
  const dominantTraits = results?.dominantTraits || [];
  const scores = results?.scores || {};

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <h3 className="text-2xl font-bold text-center mb-6">
        Your Holland Code: 
        <span className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
          {results?.hollandCode || 'Unknown'}
        </span>
      </h3>

      {dominantTraits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {dominantTraits.map((trait, index) => (
            <div
              key={`${trait}-${index}`}
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
              <p className="text-sm text-gray-600 mt-1">
                {getTraitDescription(trait)}
              </p>
              <p className="mt-2 font-medium">
                Score: {scores[trait] || 0}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mb-8">
          No dominant traits identified
        </div>
      )}

      <h4 className="font-bold mb-2">Full Breakdown:</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(scores).map(([trait, score]) => (
          <div key={trait} className="px-3 py-2 bg-gray-100 rounded">
            {getTraitFullName(trait)}: {score}
          </div>
        ))}
      </div>
    </div>
  );
};

const TestView = ({
  allQuestions,
  selectedAnswers,
  answerOptions,
  answerMapping,
  totalAnswered,
  handleAnswerChange,
  handleSubmit,
  submitLoading,
  setCreateLevelThree
}) => (
  <>
    <div className="bg-gray-100 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-3 text-center">
        How to Answer:
      </h3>
      <p className="mb-4">
        For each activity, select how much you would enjoy doing it:
      </p>
      <div className="flex justify-center space-x-6">
        {answerOptions.map(option => (
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

    <h3 className="text-xl font-semibold mb-4 text-center">
      Progress: {totalAnswered} / {allQuestions.length}
    </h3>

    <div className="space-y-4">
      {allQuestions.map(question => (
        <div key={question._id} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold mb-4">
            {question.question}
          </h4>
          <div className="flex justify-center space-x-4">
            {answerOptions.map(option => (
              <div 
                key={option}
                onClick={() => handleAnswerChange(question._id, option)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-md mx-auto cursor-pointer transition ${
                  selectedAnswers[question._id]?.response === answerMapping[option]
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-center space-x-4 mt-8">
      <button
        onClick={() => setCreateLevelThree(false)}
        className="px-6 py-2 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100 transition"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={totalAnswered !== allQuestions.length || submitLoading}
        className={`px-6 py-2 rounded-md font-semibold min-w-[180px] transition ${
          totalAnswered !== allQuestions.length || submitLoading
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
);

LevelThree.propTypes = {
  profileData: PropTypes.shape({
    _id: PropTypes.string,
  }),
  setCreateLevelThree: PropTypes.func.isRequired,
  handleProfileData: PropTypes.func,
};

export default LevelThree;