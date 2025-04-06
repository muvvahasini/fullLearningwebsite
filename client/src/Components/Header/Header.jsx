import {Link} from 'react-router-dom';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Header = () => {
    const jwtToken = Cookies.get('jwt_token');
    console.log(jwtToken);
    const navigate = useNavigate();

    const onLogin = () =>{
        navigate('/login');
    }

    const onLogout = () =>{
        Cookies.remove('jwt_token');
        navigate('/');
    }

    return (
    <ul className='ul-elements-home'>
        <li className='list-elements'>
            <img src='https://tse2.mm.bing.net/th?id=OIP.bcTWKYpgWXmr91wiL4_ZBAHaHa&pid=Api&P=0&h=180' className='image-logo' alt='logo' />
        </li>
        <li className='list-elements'>
            <Link to='/home' className='link-header'>
            Home
            </Link>
        </li>
        <li className='list-elements'>
            <Link to='/quiz' className='link-header'>
                Quiz
            </Link>
        </li>
        <li className='list-elements'>
           <Link to='dashboard' className='link-header'>
             DashBoard
            </Link>
        </li>
        <li className='list-elements'>
        <Link to='/profile' className='link-header'>
            Profile
        </Link>
        </li>
        <li className='list-elements'>
        <Link to='/platform' className='link-header'>
            createQuiz
        </Link>
        </li>
        <li className='list-elements'>
        <button className='button' onClick={jwtToken === undefined ? onLogin : onLogout}>
            {jwtToken !== undefined ? 'logOut' : 'logIn'}
        </button>
        </li>
    </ul>
)
}

export default Header