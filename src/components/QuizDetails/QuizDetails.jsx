import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

const QuizDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [attempts, setAttempts] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const quizTitle = new URLSearchParams(location.search).get('title');

  useEffect(() => {
    // Redirect if not logged in or not a professor
    if (localStorage.getItem('role') !== 'prof' || localStorage.getItem('isLoggedIn') !== 'true') {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/attempts/quiz/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const quizDetails = response.data;
        if (quizDetails.length > 0) {
          setIsReady(true);
        }

        setAttempts(response.data);
      } catch (error) {
        console.error('Error fetching attempts for quiz', error);
      }
    };

    fetchAttempts();
  }, [id]);

  const calculateScore = (answers) => {
    const correctAnswers = answers.filter((answer) => answer.selectedOption.correct);
    return ((correctAnswers.length / answers.length) * 100).toFixed(2);
  };

  const getStudentName = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.fullName;
    } catch (error) {
      console.error('Error fetching student details', error);
      return 'Unknown';
    }
  };

  const getQuestionTitle = async (questionId) => {
    try {
      const response = await axios.get(`http://localhost:3000/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.text;
    } catch (error) {
      console.error('Error fetching question details', error);
      return 'Unknown';
    }
  };

  const fetchAdditionalDetails = async () => {
    const updatedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        const studentName = await getStudentName(attempt.studentId);
        const updatedAnswers = await Promise.all(
          attempt.answers.map(async (answer) => {
            const questionTitle = await getQuestionTitle(answer.questionId);
            return { ...answer, questionTitle };
          })
        );
        return { ...attempt, studentName, answers: updatedAnswers };
      })
    );
    setAttempts(updatedAttempts);
  };

  useEffect(() => {
    if (isReady) {
      fetchAdditionalDetails();
    }
  }, [isReady]);

  return (
    <div>
      {isReady ? null : <h2>Fetching attempts...</h2>}
      <h2>{quizTitle}</h2>

      {attempts.map((attempt) => (
        <div key={attempt.id}>
          <ul>
            <li>

              <p>Student Name: {attempt.studentName}</p>
              <p>Score: {calculateScore(attempt.answers)}%</p>
              <ul>
                {attempt.answers.map((answer) => (
                  <li key={answer.id}>
                    <p>Question Title: {answer.questionTitle}</p>
                    <p>Selected Option: {answer.selectedOption.text}</p>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuizDetails;
