import { useState, useEffect } from 'react';


const StudentDashbord = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');


  useEffect(() => {
    if (localStorage.getItem('role') !== 'student') {
      window.location.href = '/login'; // Redirect to the login page 
    }
    if(localStorage.getItem('isLoggedIn')===false){
      window.location.href = '/login';
    }


  }, []);

  const handleQuizClick = (quizId) => {
    window.location.href = `/quiz/${quizId}`;
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`http://localhost:3000/quizzes`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`  
        }
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des quiz');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des quiz', error);
        setError('Erreur lors de la récupération des quiz');
      }
    };

    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', false);
    window.location.href = '/login'; // Redirect to the login page
  };

  return (
    <div>
      <h1>Student Dashboard</h1>
      
      <h4>Bienvenu {localStorage.getItem('fullName')} !</h4>
      <a onClick={handleLogout}>Logout</a>
      
      {error && <p>{error}</p>}
      <ul>
        {quizzes.map((quiz) => (
          // changes => express : _id  spring : id
          <li key={quiz.id}>
            <button onClick={() => handleQuizClick(quiz.id)}>{quiz.title}</button>
          </li>
        ))}
      </ul>
      
    </div>
    
  );
};

export default StudentDashbord;
