import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const id = useParams().id;

  useEffect(() => {

    if (localStorage.getItem('role') !== 'student') {
      window.location.href = '/login'; // Redirect to the login page 
    }
    if(localStorage.getItem('isLoggedIn')===false){
      window.location.href = '/login';
    }
    // activate this code when using express to check the token
    // if (!localStorage.getItem('token')) {
    //   window.location.href = '/login'; 
    // }
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/quizzes/${id}`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`  
        }
        });
        setQuiz(response.data);
        initializeSelectedAnswers(response.data.questions);
      } catch (error) {
        console.error('Erreur lors de la récupération du quiz', error);
      }
    };

    fetchQuiz();
  }, [id]);

  const initializeSelectedAnswers = (questions) => {
    const initialAnswers = {};
    questions.forEach((question) => {
      // changes => express : _id  spring : id
      initialAnswers[question.id] = null;
    });
    setSelectedAnswers(initialAnswers);
  };

  const handleRadioChange = (questionId, optionId) => {
    const updatedAnswers = { ...selectedAnswers };
    updatedAnswers[questionId] = optionId;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
  
      const answersArray = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => {

        const question = quiz.questions.find((q) => q.id === questionId);
        const selectedOption = question.options.find((option) => option.id === selectedOptionId);
  
        return {
          questionId: questionId,
          selectedOption: {
            text: selectedOption.text,
            
            correct: selectedOption.correct,
          },
        };
      });
  
      const idStudent = localStorage.getItem('UserId');
      const response = await axios.post(`http://localhost:3000/attempts/create`, {
        studentId: idStudent,
        quizId: id,
        answers: answersArray,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`  
      }
      });
  
      console.log('Réponses soumises avec succès:', response.data);
      window.location.href = '/studentquizzes'; 
  
      // Réinitialiser les réponses sélectionnées après la soumission
      initializeSelectedAnswers(quiz.questions);
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses', error);
    } finally {
      setSubmitting(false);
    }
  };
  

  if (!quiz) {
    return <p>Chargement de quiz...</p>;
  }

  return (
    <div>
      <h2>{quiz.title}</h2>
      {quiz.questions.map((question) => (

        <div key={question.id}>
          <p>{question.text}</p>
          {question.options.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  checked={selectedAnswers[question.id] === option.id}
                  onChange={() => handleRadioChange(question.id, option.id)}
                />
                {option.text}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitting}>
        Soumettre les réponses
      </button>
    </div>
  );
};

export default QuizPage;
