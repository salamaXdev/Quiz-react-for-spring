
import { useState,useEffect } from 'react';
import axios from 'axios';
import  './CreateQuiz.css'

const CreateQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', options: [{ text: '', correct: false }] }]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [{ text: '', correct: false }] }]);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: '', correct: false });
    setQuestions(updatedQuestions);
  };

  useEffect(() => {
    if (localStorage.getItem('role') !== 'prof') {
      window.location.href = '/login';
    }
    if(localStorage.getItem('isLoggedIn')===false){
      window.location.href = '/login';
    }
  }, []);

  const handleQuizSubmit = async () => {
    try {
      const prof_id = localStorage.getItem('UserId');
      const response = await axios.post('http://localhost:3000/quizzes/create', {
        title: quizTitle,
        questions,
        professor_id:prof_id
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`  
      }
      });

      console.log('Quiz ajouté avec succès :', response.data);

      window.location.href = '/profquizzes'; 
    } catch (error) {
      console.error('Erreur lors de l\'ajout du quiz :', error);
    }
  };

  return (
    <div>
      <h2>Créer un nouveau quiz</h2>
        <input placeholder='Titre du quiz' type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />

      {questions.map((question, questionIndex) => (
        <div key={questionIndex}>
       
            
            <input
            placeholder='Question'
              type="text"
              value={question.text}
              onChange={(e) => {
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex].text = e.target.value;
                setQuestions(updatedQuestions);
              }}
            />
         

          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
            
                
                <input
                placeholder='Option'
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[questionIndex].options[optionIndex].text = e.target.value;
                    setQuestions(updatedQuestions);
                  }}
                />
              <br></br>
              <label>
                Correcte:<br></br>
                <input
                  type="checkbox"
                  checked={option.correct}
                  onChange={() => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[questionIndex].options[optionIndex].correct = !option.correct;
                    setQuestions(updatedQuestions);
                  }}
                />
              </label>
            </div>
          ))}

          <button type="button" onClick={() => addOption(questionIndex)}>
            Ajouter une option
          </button>
        </div>
      ))}

      <button type="button" onClick={addQuestion}>
        Ajouter une question
      </button>

      <button type="button" onClick={handleQuizSubmit}>
        Enregistrer le quiz
      </button>
    </div>
  );
};

export default CreateQuiz;
