import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import logoMS from '../../assets/logoMS.png';
import '../Global/Global.css';
import { Link } from 'react-router-dom';
import { checkUserDetails } from '../../services/apiService';

function Home() {
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
  const [hashedPassword, setHashedPassword] = React.useState(localStorage.getItem('hashedPassword') || null);

  const cardData = [
    { id: 1, title: 'Join Course', description: 'Sign up for a new course.', link: '/joinCourse' },
    { id: 2, title: 'My Courses', description: 'View your enrolled courses.', link: '/myCourses' },
    { id: 3, title: 'Create Course', description: 'Start a new course.', link: '/createCourse', isTeacherOrAdmin: true },
    { id: 4, title: 'Forum', description: 'Access the main forum page.', link: '/mainForum' },
    { id: 5, title: 'Your posts', description: 'Check all your forum posts.', link: '/userPosts' },
    { id: 6, title: 'Reported posts', description: 'Check all reported posts and resovle reports.', link: '/reportPosts', isAdmin: true },
    { id: 7, title: 'Reported comments', description: 'Check all reported comments and resovle reports.', link: '/reportComments', isAdmin: true }
  ];

  useEffect(() => {
    handleCheckUserDetailsSubmit();
  }, []);

  const handleCheckUserDetailsSubmit = async () => {
    const registerResponse = await checkUserDetails(username, hashedPassword);

    if (registerResponse.isSuccess) {
      setIsTeacherOrAdmin(registerResponse.isAdminOrTeacher);
      setIsAdmin(registerResponse.isAdmin);
    }
  }

  return (
    <div className='parent-div'>
      <Navbar />
      <div className='panel panel-default'>
        <div className='panel-body'>
          <div className='row mt-3 me-0 text-center'>
            <h2>Welcome to online education platform!</h2>
            <h5>Please select a tab that interest you the most:</h5>
          </div>
          <div className='row mt-3 me-0 text-center'>
            <div className='d-flex flex-wrap'>
              {cardData.map((card) => (
                (card.isTeacherOrAdmin === undefined || isTeacherOrAdmin) && (card.isAdmin === undefined || isAdmin)  && (
                  <Link to={card.link} key={card.id} style={{ textDecoration: 'none', color: 'inherit', width: '22%', margin: '0.5rem' }}>
                    <div className='card mb-4' style={{ cursor: 'pointer' }}>
                      <div className='card-body text-center d-flex flex-column'>
                        <h5 className='card-title'>{card.title}</h5>
                        <p className='card-text'>{card.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
          <div className='row mt-3 me-0'>
            <div className='text-center'>
              <img src={logoMS} alt='Description' width='400' height='400' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;